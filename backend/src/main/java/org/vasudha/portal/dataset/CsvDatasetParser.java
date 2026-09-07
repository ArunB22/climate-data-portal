package org.vasudha.portal.dataset;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.vasudha.portal.domain.ChartType;
import org.vasudha.portal.web.error.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/**
 * Parses an uploaded CSV into a generic {columns, rows} payload and validates
 * it against the required shape for the chart type the Admin selected. Rows
 * are kept as a list of header->value maps rather than a fixed table, which
 * is what lets the frontend render any future dataset of the same shape
 * without backend or frontend code changes.
 */
@Service
public class CsvDatasetParser {

    private static final int MAX_ERRORS = 30;

    public DatasetPayload parseAndValidate(MultipartFile file, ChartType chartType) {
        List<CSVRecord> records;
        List<String> originalHeaders;

        try (var reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            CSVFormat format = CSVFormat.DEFAULT.builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setTrim(true)
                    .setIgnoreEmptyLines(true)
                    .build();
            CSVParser parser = format.parse(reader);
            originalHeaders = parser.getHeaderNames();
            records = parser.getRecords();
        } catch (IOException ex) {
            throw new ApiException(400, "Could not read the CSV file: " + ex.getMessage());
        } catch (IllegalArgumentException ex) {
            throw new ApiException(400, "The CSV file has no header row or is malformed: " + ex.getMessage());
        }

        if (originalHeaders.isEmpty()) {
            throw new ApiException(400, "The CSV file has no header row.");
        }

        Map<String, String> headerByLowercase = new LinkedHashMap<>();
        for (String header : originalHeaders) {
            headerByLowercase.put(header.toLowerCase(Locale.ROOT), header);
        }

        RequiredColumns required = requiredColumnsFor(chartType, headerByLowercase);
        List<String> missing = required.missing();
        if (!missing.isEmpty()) {
            throw new ApiException(400, "Missing required column(s) for this chart type: " + String.join(", ", missing));
        }

        if (records.isEmpty()) {
            throw new ApiException(400, "The CSV file has no data rows.");
        }

        List<String> errors = new ArrayList<>();
        List<Map<String, Object>> rows = new ArrayList<>();

        for (CSVRecord record : records) {
            long rowNumber = record.getRecordNumber() + 1; // +1 to account for the header line
            Map<String, Object> row = new LinkedHashMap<>();

            for (String header : originalHeaders) {
                row.put(header, record.isSet(header) ? record.get(header) : null);
            }

            validateRow(chartType, required, row, rowNumber, errors);
            rows.add(row);

            if (errors.size() >= MAX_ERRORS) {
                errors.add("... additional rows also failed validation (showing first " + MAX_ERRORS + ")");
                break;
            }
        }

        if (!errors.isEmpty()) {
            throw new CsvValidationException(errors);
        }

        return new DatasetPayload(originalHeaders, rows);
    }

    private record RequiredColumns(String latitude, String longitude, String state, String time, String value,
                                    List<String> missing) {
    }

    private RequiredColumns requiredColumnsFor(ChartType chartType, Map<String, String> headerByLowercase) {
        List<String> missing = new ArrayList<>();
        String value = headerByLowercase.get("value");
        if (value == null) {
            missing.add("value");
        }

        String latitude = null;
        String longitude = null;
        String state = null;
        String time = null;

        switch (chartType) {
            case LATLONG_MAP -> {
                latitude = headerByLowercase.get("latitude");
                longitude = headerByLowercase.get("longitude");
                if (latitude == null) missing.add("latitude");
                if (longitude == null) missing.add("longitude");
            }
            case STATE_HEATMAP -> {
                state = headerByLowercase.get("state");
                if (state == null) missing.add("state");
            }
            case LINE, BAR, AREA -> {
                time = headerByLowercase.getOrDefault("year", headerByLowercase.get("date"));
                if (time == null) missing.add("year (or date)");
            }
        }

        return new RequiredColumns(latitude, longitude, state, time, value, missing);
    }

    private void validateRow(ChartType chartType, RequiredColumns cols, Map<String, Object> row,
                              long rowNumber, List<String> errors) {
        parseDouble(row, cols.value(), rowNumber, "value", errors, Double.NEGATIVE_INFINITY, Double.POSITIVE_INFINITY);

        switch (chartType) {
            case LATLONG_MAP -> {
                parseDouble(row, cols.latitude(), rowNumber, "latitude", errors, -90, 90);
                parseDouble(row, cols.longitude(), rowNumber, "longitude", errors, -180, 180);
            }
            case STATE_HEATMAP -> {
                Object raw = row.get(cols.state());
                String state = raw == null ? "" : raw.toString();
                if (state.isBlank()) {
                    errors.add("Row " + rowNumber + ": state is required.");
                } else if (!IndianStates.isValid(state)) {
                    errors.add("Row " + rowNumber + ": \"" + state + "\" is not a recognised Indian state/UT name.");
                }
            }
            case LINE, BAR, AREA -> validateTimeColumn(row, cols.time(), rowNumber, errors);
        }
    }

    private void validateTimeColumn(Map<String, Object> row, String column, long rowNumber, List<String> errors) {
        Object raw = row.get(column);
        String text = raw == null ? "" : raw.toString().trim();
        if (text.isBlank()) {
            errors.add("Row " + rowNumber + ": " + column + " is required.");
            return;
        }

        if (text.matches("\\d{4}")) {
            int year = Integer.parseInt(text);
            if (year < 1900 || year > 2100) {
                errors.add("Row " + rowNumber + ": " + column + " (" + text + ") is out of range.");
            }
            return;
        }

        try {
            LocalDate.parse(text);
        } catch (DateTimeParseException ex) {
            errors.add("Row " + rowNumber + ": " + column + " (\"" + text + "\") must be a 4-digit year or an ISO date (YYYY-MM-DD).");
        }
    }

    private void parseDouble(Map<String, Object> row, String column, long rowNumber, String label,
                              List<String> errors, double min, double max) {
        if (column == null) {
            return;
        }
        Object raw = row.get(column);
        String text = raw == null ? "" : raw.toString().trim();
        if (text.isBlank()) {
            errors.add("Row " + rowNumber + ": " + label + " is required.");
            return;
        }
        try {
            double parsed = Double.parseDouble(text);
            if (parsed < min || parsed > max) {
                errors.add("Row " + rowNumber + ": " + label + " (" + text + ") must be between " + min + " and " + max + ".");
            } else {
                row.put(column, parsed);
            }
        } catch (NumberFormatException ex) {
            errors.add("Row " + rowNumber + ": " + label + " (\"" + text + "\") is not a number.");
        }
    }
}

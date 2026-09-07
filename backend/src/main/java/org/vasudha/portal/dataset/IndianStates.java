package org.vasudha.portal.dataset;

import java.util.Set;
import java.util.stream.Collectors;

/**
 * State names as they appear in the ST_NM property of the India state
 * boundaries GeoJSON the frontend renders the heatmap with. A state-wise
 * dataset row can only be plotted if its name matches one of these exactly
 * (case-insensitive), so uploads are validated against the same list.
 */
public final class IndianStates {

    private static final Set<String> NAMES = Set.of(
            "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
            "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli", "Daman and Diu",
            "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
            "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
            "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
            "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
            "The Dadra and Nagar Haveli and Daman and Diu", "Tripura", "Uttar Pradesh",
            "Uttarakhand", "West Bengal"
    );

    private static final Set<String> LOWERCASE = NAMES.stream()
            .map(String::toLowerCase)
            .collect(Collectors.toUnmodifiableSet());

    private IndianStates() {
    }

    public static boolean isValid(String name) {
        return name != null && LOWERCASE.contains(name.trim().toLowerCase());
    }
}

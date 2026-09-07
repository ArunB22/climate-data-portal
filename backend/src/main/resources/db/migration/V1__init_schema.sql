CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN')),
    enabled         BOOLEAN      NOT NULL DEFAULT TRUE,
    created_by      UUID         REFERENCES users(id),
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE datasets (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id         UUID         NOT NULL REFERENCES users(id),
    domain           VARCHAR(20)  NOT NULL CHECK (domain IN ('CLIMATE', 'ENERGY', 'POWER')),
    chart_type       VARCHAR(20)  NOT NULL CHECK (chart_type IN ('LATLONG_MAP', 'STATE_HEATMAP', 'LINE', 'BAR', 'AREA')),
    title            VARCHAR(255) NOT NULL,
    status           VARCHAR(20)  NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    payload_json      TEXT        NOT NULL,
    published_order  BIGINT,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    decided_at       TIMESTAMPTZ
);

CREATE INDEX idx_datasets_admin_id ON datasets(admin_id);
CREATE INDEX idx_datasets_status_domain ON datasets(status, domain);
CREATE INDEX idx_datasets_published_order ON datasets(published_order);

CREATE SEQUENCE dataset_published_order_seq;

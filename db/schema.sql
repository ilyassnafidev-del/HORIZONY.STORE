CREATE TABLE IF NOT EXISTS store_admins (
 id uuid PRIMARY KEY, username text NOT NULL UNIQUE, password_hash text NOT NULL,
 must_change_password boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS store_sessions (
 token_hash text PRIMARY KEY, kind text NOT NULL CHECK(kind IN ('admin','customer')),
 subject_id uuid NOT NULL, expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS store_sessions_expiry ON store_sessions(expires_at);
CREATE TABLE IF NOT EXISTS store_orders (
 id uuid PRIMARY KEY, customer_id uuid NOT NULL, request_key uuid NOT NULL, request_hash text NOT NULL,
 shipping jsonb NOT NULL, items jsonb NOT NULL, subtotal integer NOT NULL CHECK(subtotal>0),
 shipping_cents integer NOT NULL CHECK(shipping_cents>=0), total integer NOT NULL CHECK(total>0),
 refund_cents integer NOT NULL DEFAULT 0 CHECK(refund_cents>=0),
 test_mode boolean NOT NULL DEFAULT true,
 payment_status text NOT NULL DEFAULT 'UNPAID' CHECK(payment_status IN ('UNPAID','PENDING','PAID','CANCELED','PARTIALLY_REFUNDED','REFUNDED')),
 fulfillment text NOT NULL DEFAULT 'UNFULFILLED' CHECK(fulfillment IN ('UNFULFILLED','PROCESSING','SHIPPED','DELIVERED')),
 stripe_payment_intent text UNIQUE, created_at timestamptz NOT NULL DEFAULT now(), paid_at timestamptz,
 UNIQUE(customer_id,request_key)
);
ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS test_mode boolean NOT NULL DEFAULT true;
CREATE INDEX IF NOT EXISTS store_orders_customer ON store_orders(customer_id,created_at DESC);
CREATE INDEX IF NOT EXISTS store_orders_status ON store_orders(payment_status,created_at DESC);
CREATE TABLE IF NOT EXISTS store_checkout_attempts (
 id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES store_orders(id),
 session_id text UNIQUE, stripe_url text, status text NOT NULL DEFAULT 'CREATING', created_at timestamptz NOT NULL DEFAULT now(),
 expires_at timestamptz
);
CREATE INDEX IF NOT EXISTS store_attempts_order ON store_checkout_attempts(order_id,created_at DESC);
CREATE TABLE IF NOT EXISTS store_payment_events (
 id text PRIMARY KEY, event_type text NOT NULL, order_id uuid REFERENCES store_orders(id), received_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS store_order_notes (
 id uuid PRIMARY KEY, order_id uuid NOT NULL REFERENCES store_orders(id), admin_id uuid NOT NULL REFERENCES store_admins(id),
 note text NOT NULL CHECK(length(note)<=2000), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS store_rate_limits (
 scope text NOT NULL, key_hash text NOT NULL, bucket bigint NOT NULL, hits integer NOT NULL,
 PRIMARY KEY(scope,key_hash,bucket)
);
CREATE TABLE IF NOT EXISTS store_shipping_rates (
 country char(2) PRIMARY KEY, cents integer NOT NULL CHECK(cents>=0 AND cents<=100000),
 enabled boolean NOT NULL DEFAULT true, updated_at timestamptz NOT NULL DEFAULT now()
);

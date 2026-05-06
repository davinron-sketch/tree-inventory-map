CREATE TABLE IF NOT EXISTS t_p59085732_tree_inventory_map.hedge_history (
  id          SERIAL PRIMARY KEY,
  hedge_id    UUID NOT NULL,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  changed_by  TEXT,
  snapshot    JSONB NOT NULL
);
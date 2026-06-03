# 08 Pricing Engine & Inventory Management

## Pricing Engine Calculations (`pricingEngine.ts`)
The pricing engine is a critical TypeScript module that evaluates quotes on the fly:
- **Lead Pricing Standard**: For hotels, it dynamically pulls the lowest rate from double occupancy overrides (`occupancy_pricing["2"]`), preventing supplements or single rates from skewing the "As From" price.
- **Pricing Override Priority**: More specific ranges (e.g. weekend overrides) take priority over monthly overrides by sorting by range duration ascending before matching.
- **Meal Plan supplements**: Supplement values (BB, HB, FB) are layered additively on top of room rates. All Inclusive (AI) is globally deprecated.

---

## Inventory Control (Price Manager Grid)
Inventory levels and date constraints are managed via the Price Manager grid:
- **Stop-Sell enforcement**: Setting `is_stop_sell = true` adds the dates to the `stopDates` collection. This collection disables matching dates on the Guest calendar.
- **Self-Healing Room Selection**: If seasonal overrides change, the wizard self-heals by resetting invalid selections.

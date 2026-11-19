/**
 * Travel Lounge Mobile App — Neon Lakebase Postgres Adapter
 * Routes all mobile app database queries through https://travellounge.mu/api/db/query
 * so the native app stays 100% synchronized with the live web-app Neon backend.
 */

const WEB_API_URL = (process.env.EXPO_PUBLIC_WEB_URL || 'https://travellounge.mu').replace(/\/+$/, '');

const NUMERIC_FIELDS = new Set([
  'rating', 'price', 'strikethrough_price', 'service_fee',
  'weekday_price', 'weekend_price', 'price_teen', 'price_child', 'price_infant',
  'priority', 'max_adults', 'max_children', 'max_teens', 'max_infants',
  'duration_days', 'duration_hours', 'max_occupancy', 'min_stay_days', 'child_age_limit',
  'display_order', 'order_index'
]);

function normalizeRowNumbers(item: any): any {
  if (!item || typeof item !== 'object') return item;
  if (Array.isArray(item)) return item.map(normalizeRowNumbers);
  for (const key of Object.keys(item)) {
    const val = item[key];
    if (NUMERIC_FIELDS.has(key) && typeof val === 'string' && val.trim() !== '') {
      const parsed = Number(val);
      if (Number.isFinite(parsed)) item[key] = parsed;
    }
  }
  return item;
}

export interface ConditionItem {
  type: 'eq' | 'neq' | 'is' | 'gt' | 'gte' | 'lt' | 'lte' | 'ilike' | 'like' | 'in' | 'contains' | 'or';
  col: string;
  val: any;
}

export class MobileNeonQueryBuilder {
  private table: string;
  private selectCols = '*';
  private conditionList: ConditionItem[] = [];
  private orderParts: string[] = [];
  private limitCount?: number;
  private offsetCount?: number;
  private isSingle = false;
  private isMaybeSingle = false;
  private operation: 'select' | 'insert' | 'update' | 'upsert' | 'delete' = 'select';
  private mutateData: any = undefined;

  constructor(table: string) {
    this.table = table;
  }

  select(cols = '*') {
    this.selectCols = cols;
    return this;
  }

  insert(data: any) {
    this.operation = 'insert';
    this.mutateData = data;
    return this;
  }

  update(data: any) {
    this.operation = 'update';
    this.mutateData = data;
    return this;
  }

  upsert(data: any) {
    this.operation = 'upsert';
    this.mutateData = data;
    return this;
  }

  delete() {
    this.operation = 'delete';
    return this;
  }

  eq(col: string, val: any) {
    this.conditionList.push({ type: 'eq', col, val });
    return this;
  }

  neq(col: string, val: any) {
    this.conditionList.push({ type: 'neq', col, val });
    return this;
  }

  is(col: string, val: any) {
    this.conditionList.push({ type: 'is', col, val });
    return this;
  }

  not(col: string, op: string, val: any) {
    const cleanOp = String(op || '').toLowerCase();
    if (cleanOp === 'is' && val === null) {
      this.conditionList.push({ type: 'or', col: '', val: `${col}.is.not.null` });
    } else if (cleanOp === 'eq') {
      this.conditionList.push({ type: 'neq', col, val });
    } else if (cleanOp === 'in' && Array.isArray(val)) {
      this.conditionList.push({ type: 'or', col: '', val: `${col}.not.in.(${val.join(',')})` });
    }
    return this;
  }

  gt(col: string, val: any) {
    this.conditionList.push({ type: 'gt', col, val });
    return this;
  }

  gte(col: string, val: any) {
    this.conditionList.push({ type: 'gte', col, val });
    return this;
  }

  lt(col: string, val: any) {
    this.conditionList.push({ type: 'lt', col, val });
    return this;
  }

  lte(col: string, val: any) {
    this.conditionList.push({ type: 'lte', col, val });
    return this;
  }

  ilike(col: string, val: any) {
    this.conditionList.push({ type: 'ilike', col, val });
    return this;
  }

  like(col: string, val: any) {
    this.conditionList.push({ type: 'like', col, val });
    return this;
  }

  in(col: string, vals: any[]) {
    this.conditionList.push({ type: 'in', col, val: vals });
    return this;
  }

  contains(col: string, val: any) {
    this.conditionList.push({ type: 'contains', col, val });
    return this;
  }

  or(clause: string) {
    this.conditionList.push({ type: 'or', col: '', val: clause });
    return this;
  }

  order(col: string, options?: { ascending?: boolean; nullsFirst?: boolean }) {
    const dir = options?.ascending === false ? 'DESC' : 'ASC';
    const nulls = options?.nullsFirst === false ? ' NULLS LAST' : '';
    this.orderParts.push(`"${col}" ${dir}${nulls}`);
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number) {
    this.offsetCount = from;
    this.limitCount = Math.max(0, to - from + 1);
    return this;
  }

  single() {
    this.isSingle = true;
    this.limitCount = 1;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingle = true;
    this.limitCount = 1;
    return this;
  }

  async execute(): Promise<{ data: any; error: any; count?: number }> {
    try {
      const orderClause = this.orderParts.length > 0 ? `ORDER BY ${this.orderParts.join(', ')}` : '';
      const response = await fetch(`${WEB_API_URL}/api/db/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: this.table,
          operation: this.operation,
          mutateData: this.mutateData,
          selectCols: this.selectCols,
          conditions: this.conditionList,
          orderClause,
          limitCount: this.limitCount,
          offsetCount: this.offsetCount,
          isSingle: this.isSingle,
          isMaybeSingle: this.isMaybeSingle,
        }),
      });

      const json = await response.json();
      if (!response.ok || json.error) {
        return { data: null, error: json.error || new Error(`HTTP ${response.status}`) };
      }
      return { data: normalizeRowNumbers(json.data), error: null, count: json.count };
    } catch (err) {
      console.error(`[MobileNeon] Query failed on ${this.table}:`, err);
      return { data: null, error: err };
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

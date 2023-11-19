import { Condition } from "../shared/types";

export type FilterStrategy = (filters: Record<string, any>) => Record<string, any>;

export const dateRangeFilterStrategy: FilterStrategy = (filters) => {
    const startDate = filters.startDate ? new Date(filters.startDate.toString()) : undefined;
    const endDate = filters.endDate ? new Date(filters.endDate.toString()) : undefined;

    return {
        timestamp: startDate && endDate ? { $gte: startDate, $lte: endDate } : undefined,
    };
};

const operatorMapping: Record<string, string> = {
    '=': '$eq',
    '!=': '$ne',
    '~': '$regex',
    '!~': '$not',
};

export const conditionsFilterStrategy: FilterStrategy = (filters) => {
    const conditions: Condition[] = filters.filters || [];    

    return {
        $and: conditions.map((condition) => ({
            [condition.field]: { [operatorMapping[condition.operator]]: condition.value },
        })),
    };
};
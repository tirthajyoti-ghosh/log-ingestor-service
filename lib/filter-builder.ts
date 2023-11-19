import { FilterStrategy, textSearchFilterStrategy, dateRangeFilterStrategy } from './filter-strategies';

type FilterBuilder = (queryStringParams: Record<string, any>) => Record<string, any>;

export const filterBuilder: FilterBuilder = (queryStringParams) => {
    const applyStrategies = (...strategies: FilterStrategy[]) => (initialConditions: Record<string, any>) =>
        strategies.reduce((conditions, strategy) => {
            const strategyConditions = strategy(queryStringParams);
            return {
                ...conditions,
                ...(strategyConditions.$or ? { $or: [...(conditions.$or || []), ...strategyConditions.$or] } : strategyConditions),
            };
        }, initialConditions);

    const applyAdditionalFilters = (initialConditions: Record<string, any>) =>
        Object.keys(queryStringParams).reduce(
            (conditions, key) =>
                key !== 'q' && key !== 'startDate' && key !== 'endDate'
                    ? {
                        ...conditions,
                        [key]: { $regex: queryStringParams[key], $options: 'i' },
                    }
                    : conditions,
            initialConditions
        );

    return applyAdditionalFilters(
        applyStrategies(textSearchFilterStrategy, dateRangeFilterStrategy)({})
    );
};

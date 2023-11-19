import { SearchRequest } from '../shared/types';
import { FilterStrategy, textSearchFilterStrategy, dateRangeFilterStrategy, conditionsFilterStrategy } from './filter-strategies';

type FilterBuilder = {
    (requestBody: SearchRequest): Record<string, any>;
}

export const filterBuilder: FilterBuilder = (requestBody) => {
    const applyStrategies = (...strategies: FilterStrategy[]) => (initialConditions: Record<string, any>) =>
        strategies.reduce((conditions, strategy) => {
            const strategyConditions = strategy(requestBody);
            return {
                ...conditions,
                ...(strategyConditions.$or ? { $or: [...(conditions.$or || []), ...strategyConditions.$or] } : strategyConditions),
            };
        }, initialConditions);

    const applyAdditionalFilters = (initialConditions: Record<string, any>) =>
        Object.keys(requestBody).reduce(
            (conditions, key) =>
                key !== 'q' && key !== 'startDate' && key !== 'endDate' && key !== 'conditions'
                    ? {
                        ...conditions,
                        [key]: { $regex: requestBody[key], $options: 'i' },
                    }
                    : conditions,
            initialConditions
        );

    return applyAdditionalFilters(
        applyStrategies(textSearchFilterStrategy, dateRangeFilterStrategy, conditionsFilterStrategy)({})
    );
};

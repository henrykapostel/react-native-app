const initialState = {
    initial: 'welcome',
    loading: false,
    initialTab: 0,
}

export default function reducer(state = initialState, action) {
    switch (action.type) {
        case 'UPDATE_INITIAL_ROUTE':
            return Object.assign({}, state, { initial: action.payload.route });
        case 'UPDATE_INITIAL_TAB':
            return Object.assign({}, state, { initialTab: action.payload.initialTab });
        case 'LOADING':
            return Object.assign({}, state, { loading: true });
        case 'LOADED':
            return Object.assign({}, state, { loading: false });
        default:
            return state;
    }
}

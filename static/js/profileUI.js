import { makeValuesTab, rawTab } from "./sharedTabs.js";

const values = [
    {
        name: 'Profile Settings',
        type: 'label',
    },
    {
        name: 'Profile Name',
        path: 'name',
        type: 'text',
    },
    {
        name: 'All Jokers Unlocked',
        path: 'all_unlocked',
        type: 'checkbox',
        default: false,
    },

    {
        name: 'High Scores',
        type: 'label',
    },
    {
        name: 'Highest Round',
        path: 'high_scores.furthest_round.amt',
        type: 'number'
    },
    {
        name: 'Best Hand',
        path: 'high_scores.hand.amt',
        type: 'number'
    },
    {
        name: 'Best Win Streak',
        path: 'high_scores.win_streak.amt',
        type: 'number'
    },
    {
        name: 'Current Win Streak',
        path: 'high_scores.current_streak.amt',
        type: 'number'
    },
    {
        name: 'Collection Size',
        path: 'high_scores.collection.amt',
        type: 'number'
    },
    {
        name: 'Highest Ante',
        path: 'high_scores.furthest_ante.amt',
        type: 'number'
    },
    {
        name: 'Most Money',
        path: 'high_scores.most_money.amt',
        type: 'number'
    },
    {
        name: 'Most Bosses in a Row',
        path: 'high_scores.boss_streak.amt',
        type: 'number'
    },
    {
        name: 'Best Flush Hand',
        path: 'high_scores.flush_hand.amt',
        type: 'number'
    },
    {
        name: 'Best Poker Hand Played',
        path: 'high_scores.poker_hands.amt',
        type: 'number'
    },

    {
        name: 'Base Statistics',
        type: 'label',
    },
    {
        name: 'Total Wins',
        path: 'career_stats.c_wins',
        type: 'number'
    },
    {
        name: 'Total Losses',
        path: 'career_stats.c_losses',
        type: 'number'
    },
    {
        name: 'Total Rounds Played',
        path: 'career_stats.c_rounds',
        type: 'number'
    },
    {
        name: 'Hands Played',
        path: 'career_stats.c_hands_played',
        type: 'number'
    },

    {
        name: 'Card Play Statistics',
        type: 'label',
    },
    {
        name: 'Cards Played',
        path: 'career_stats.c_cards_played',
        type: 'number'
    },
    {
        name: 'Face Cards Played',
        path: 'career_stats.c_face_cards_played',
        type: 'number'
    },
    {
        name: 'Cards Sold',
        path: 'career_stats.c_cards_sold',
        type: 'number'
    },
    {
        name: 'Cards Discarded',
        path: 'career_stats.c_cards_discarded',
        type: 'number'
    },
    {
        name: 'Playing Cards Bought',
        path: 'career_stats.c_playing_cards_bought',
        type: 'number'
    },

    {
        name: 'Shop Transactions',
        type: 'label',
    },
    {
        name: 'Shop Dollars Spent',
        path: 'career_stats.c_shop_dollars_spent',
        type: 'number'
    },
    {
        name: 'Shop Rerolls',
        path: 'career_stats.c_shop_rerolls',
        type: 'number'
    },
    {
        name: 'Jokers Bought',
        path: 'career_stats.c_jokers_bought',
        type: 'number'
    },
    {
        name: 'Jokers Sold',
        path: 'career_stats.c_jokers_sold',
        type: 'number'
    },

    {
        name: 'Consumable Purchases',
        type: 'label',
    },
    {
        name: 'Tarots Bought',
        path: 'career_stats.c_tarots_bought',
        type: 'number'
    },
    {
        name: 'Planets Bought',
        path: 'career_stats.c_planets_bought',
        type: 'number'
    },
    {
        name: 'Vouchers Bought',
        path: 'career_stats.c_vouchers_bought',
        type: 'number'
    },

    {
        name: 'Consumable Usage',
        type: 'label',
    },
    {
        name: 'Tarot Reading Used',
        path: 'career_stats.c_tarot_reading_used',
        type: 'number'
    },
    {
        name: 'Planetarium Used',
        path: 'career_stats.c_planetarium_used',
        type: 'number'
    },

    {
        name: 'Interest & Earning',
        type: 'label',
    },
    {
        name: 'Dollars Earned',
        path: 'career_stats.c_dollars_earned',
        type: 'number'
    },
    {
        name: 'Round Interest Cap Streak',
        path: 'career_stats.c_round_interest_cap_streak',
        type: 'number'
    },

    {
        name: 'Streak Statistics',
        type: 'label',
    },
    {
        name: 'Single Hand Round Streak',
        path: 'career_stats.c_single_hand_round_streak',
        type: 'number'
    },

    {
        name: 'Advanced Metrics',
        type: 'label',
    },
    {
        name: 'Money Earned From Selling',
        path: 'career_stats.c_money_from_selling',
        type: 'number'
    },
    {
        name: 'Efficiency',
        path: 'career_stats.c_efficiency',
        type: 'number'
    },
];

const profileTabs = [
    makeValuesTab(values),
    rawTab,
];

export {
    profileTabs,
}
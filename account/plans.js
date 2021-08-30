'use strict';

// this is obviously AWFUL TODO: put this in postgres where it belongs
const plans = {
    "mvp_001":
        {
            "display_name": "MVP",
            "limit": 300000,
            "ratelimit_max": 0,
            "ratelimit_duration": 0,
            "price": 19.0,
            "created_at": "2019-11-03 13:30:11.606000"
        },
    "bootstrap_001":
        {
            "display_name": "Bootstrap",
            "limit": 1000000,
            "ratelimit_max": 0,
            "ratelimit_duration": 0,
            "price": 49.0,
            "created_at": "2019-11-03 13:30:11.606000"
        },
    "startup_001":
        {
            "display_name": "Startup",
            "limit": 3000000,
            "ratelimit_max": 0,
            "ratelimit_duration": 0,
            "price": 99.0,
            "created_at": "2019-11-03 13:30:11.606000"
        },
    "growth_001":
        {
            "display_name": "Growth",
            "limit": 10000000,
            "ratelimit_max": 0,
            "ratelimit_duration": 0,
            "price": 249.0,
            "created_at": "2019-11-03 13:30:11.606000"
        }
};

module.exports = plans;
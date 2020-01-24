# ip2geo

 [ip2geo](https://www.ip2geo.co) is an IP Address Geolocation API. 
 
 It is a serverless implementation, relying soly on Lambda functions written in NodeJS. 
 
 ip2geo enthusiastically uses the [servlerless framework](https://github.com/serverless/serverless).
 
 Postgres is used as the data store for subscriber and account related data, while Redis is used to hold the geo and
 
 ip2geo is deployed on AWS.
 
 
 ## Data Sources
IP address data returned by the API is sourced from a variety of reliable providers, including commercial, non-commercial and proprietary data sources. 

An example API response:

```
{
  "time_elapsed": 14,
  "request": {
    "request_id": "14a0a4fe-8eb3-4e55-9ab5-2c7e538f4fdf",
    "request_ts": "2020-01-24 09:33:40.601000",
    "source_ip": "139.29.69.78",
    "lookup_ip": "132.185.164.93",
    "is_desktop": true,
    "is_mobile": false,
    "is_smart_tv": false,
    "is_tablet": false,
    "viewer_country": "US",
    "accept_language": "en-US,en;q=0.9",
    "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36"
  },
  "status": "success",
  "status_code": 200,
  "location": {
    "ip": "132.185.164.93",
    "latitude": 51.5649,
    "longitude": -0.1351,
    "city_name": "London",
    "region_name": "England",
    "region_iso_code": "ENG",
    "postal_code": "N19",
    "country_name": "United Kingdom",
    "country_iso_code": "GB",
    "continent_name": "Europe",
    "continent_code": "EU"
  },
  "timezone": {
    "time_zone": "Europe/London",
    "time_zone_abbr": "BST",
    "time_zone_offset": 0,
    "time_zone_is_dst": false,
    "time_zone_current_time": "2020-01-24T09:33:40+00:00"
  },
  "security": {
    "is_anonymous_proxy": false,
    "is_satellite_provider": false
  },
  "isp": {
    "asn": "2818",
    "organization": "BBC BBC Internet Services, UK"
  }
}

```
 
 ## Features
 
 ### Rate Limiting
 Rate limiting is implemented using [ratelimiter] (https://github.com/tj/node-ratelimiter).
 
 ### zsets in redis
 dvdsvfbdgb
 
 
 
 ## Stripe
 cdsfsdvdg
 

 
 
 

# ip2geo
 [ip2geo](https://www.ip2geo.co) is an IP Address Geolocation API. 
 
  
 ## API Request
 
 #### Origin IP Lookup
 To look up the IP address that the current API request is coming from (i.e. the IP of your users device), pass only your API key in the query string.
 ```
 https://api.ip2geo.co/v1/ip2geo?key=YOUR_API_KEY
 ```
 
 
 #### Standard IP Lookup
 To look up a single IP address of your choice, pass an IPv4 or IPv6 address and your API key and in the query string.
 ```
https://api.ip2geo.co/v1/ip2geo?ip=IP_TO_LOOK_UP&key=YOUR_API_KEY
 ```
 
 
 ## API Response
 
An example API response:

```
{
  "time_elapsed": 13,
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

## Data Sources

IP address data returned by the API is sourced from a variety of reliable providers, including commercial, non-commercial and proprietary data sources. 


#### Geolocation and Firmographic Data

Geolocation and firmographic data reside in Redis. All IP address CIDR ranges are converted to integers and are stored using a sorted set data structure within Redis.


#### Account and Subscription Data

Account and subscription data reside in Postgress. Due to their [slowly changing dimension](https://en.wikipedia.org/wiki/Slowly_changing_dimension) nature, the codebase considers (most of) these tables immutable, and only performs INSERTS against them (i.e. no UPDATES). As a result, all history is preserved.



## Design Considerations

Speed and Scalability

API responses are served by AWS Lambda functions, written in NodeJS. All request/key authorization and API response data resides in Redis.

Typical API latencies are ~3ms (however, AWS API Gateway latencies add another ~15ms).





## Features
 
### Subscriptions and Recurring Payments
Subscriptions and recurring payments are implemented using [Stripe](https://github.com/stripe/stripe-node).

### Subscriber Email
Subscriber email is implemented by [Postmark](https://postmarkapp.com/loves/node).


## Shoutouts 
ip2geo enthusiastically uses the [serverless framework](https://github.com/serverless/serverless).
 
 
 
 

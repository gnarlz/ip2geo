'use strict'

const config = require('./config.json')

if (!process.env.VALID_KEY) {
  process.env.VALID_KEY = config.VALID_KEY
  process.env.REVOKED_KEY = config.REVOKED_KEY
  process.env.EXCEEDED_PLAN_LIMIT_KEY = config.EXCEEDED_PLAN_LIMIT_KEY
  process.env.EXCEEDED_RATE_LIMIT_KEY = config.EXCEEDED_RATE_LIMIT_KEY
  process.env.PAYMENT_PAST_DUE__KEY = config.PAYMENT_PAST_DUE__KEY
  process.env.ACCOUNT_TERMINATED__KEY = config.ACCOUNT_TERMINATED__KEY
  process.env.FREE_TRIAL_ENDED_KEY = config.FREE_TRIAL_ENDED_KEY

  process.env.IP2GEO_KEYSPACE = config.IP2GEO_KEYSPACE
  process.env.IP2ASN_KEYSPACE = config.IP2ASN_KEYSPACE

  process.env.SOURCE_IP = config.SOURCE_IP
  process.env.IPV4_IP = config.IPV4_IP
  process.env.IPV6_IP = config.IPV6_IP

  process.env.STRIPE_PRIVATE_KEY = config.STRIPE_PRIVATE_KEY
  process.env.STRIPE_MVP_PLAN = config.STRIPE_MVP_PLAN
  process.env.STRIPE_BOOTSTRAP_PLAN = config.STRIPE_BOOTSTRAP_PLAN
  process.env.STRIPE_STARTUP_PLAN = config.STRIPE_STARTUP_PLAN
  process.env.STRIPE_GROWTH_PLAN = config.STRIPE_GROWTH_PLAN

  process.env.POSTMARK_API_KEY = config.POSTMARK_API_KEY

  process.env.IP2GEO_AWS_REGION = config.IP2GEO_AWS_REGION
  process.env.CREATE_ACCOUNT_SNS_TOPIC = config.CREATE_ACCOUNT_SNS_TOPIC
  process.env.CREATE_ACCOUNT_FUNCTION_NAME = config.CREATE_ACCOUNT_FUNCTION_NAME
  process.env.AWS_SDK_LOAD_CONFIG = true // tells aws sdk to load region from ~/.aws/config and credentials from ~/.aws/credentials

  process.env.POSTGRES_HOST = config.POSTGRES_HOST
  process.env.POSTGRES_USER = config.POSTGRES_USER
  process.env.POSTGRES_PASS = config.POSTGRES_PASS
  process.env.POSTGRES_PORT = config.POSTGRES_PORT
  process.env.POSTGRES_DB = config.POSTGRES_DB

  process.env.REDIS_IP_ADDRESS = config.REDIS_IP_ADDRESS
  process.env.REDIS_PORT = config.REDIS_PORT
  process.env.REDIS_PASS = config.REDIS_PASS

  process.env.HTML_TEMPLATE_BUCKET_NAME = config.HTML_TEMPLATE_BUCKET_NAME
  process.env.HTML_TEMPLATE_KEY_NAME = config.HTML_TEMPLATE_KEY_NAME
  process.env.TEXT_TEMPLATE_BUCKET_NAME = config.TEXT_TEMPLATE_BUCKET_NAME
  process.env.TEXT_TEMPLATE_KEY_NAME = config.TEXT_TEMPLATE_KEY_NAME

  console.log('==========================================================================')
  console.log('valid API key for this test: ' + process.env.VALID_KEY)
  console.log('revoked API key for this test: ' + process.env.REVOKED_KEY)
  console.log('exceeded plan limit API key for this test: ' + process.env.EXCEEDED_PLAN_LIMIT_KEY)
  console.log('exceeded rate limit API key for this test: ' + process.env.EXCEEDED_RATE_LIMIT_KEY)
  console.log('payment past due API key for this test: ' + process.env.PAYMENT_PAST_DUE__KEY)
  console.log('account terminated API key for this test: ' + process.env.ACCOUNT_TERMINATED__KEY)
  console.log('free trial ended API key for this test: ' + process.env.FREE_TRIAL_ENDED_KEY)
  console.log('ip2geo redis keyspace for this test: ' + process.env.IP2GEO_KEYSPACE)
  console.log('ip2asn redis keyspace for this test: ' + process.env.IP2ASN_KEYSPACE)
  console.log('source IP for this test: ' + process.env.SOURCE_IP)
  console.log('valid IPV4 for this test: ' + process.env.IPV4_IP)
  console.log('valid IPV6 for this test: ' + process.env.IPV6_IP)
  console.log('stripe private key for this test: ' + process.env.STRIPE_PRIVATE_KEY)
  console.log('stripe mvp plan for this test: ' + process.env.STRIPE_MVP_PLAN)
  console.log('stripe bootstrap plan for this test: ' + process.env.STRIPE_BOOTSTRAP_PLAN)
  console.log('stripe startup plan for this test: ' + process.env.STRIPE_STARTUP_PLAN)
  console.log('stripe growth plan for this test: ' + process.env.STRIPE_GROWTH_PLAN)
  console.log('postmark api key for this test: ' + process.env.POSTMARK_API_KEY)
  console.log('ip2geo aws region for this test: ' + process.env.IP2GEO_AWS_REGION)
  console.log('ip2geo aws create account sns topic for this test: ' + process.env.CREATE_ACCOUNT_SNS_TOPIC)
  console.log('ip2geo aws create account function name for this test: ' + process.env.CREATE_ACCOUNT_FUNCTION_NAME)
  console.log('aws load config for this test: ' + process.env.AWS_SDK_LOAD_CONFIG)
  console.log('postgres host for this test: ' + process.env.POSTGRES_HOST)
  console.log('postgres user for this test: ' + process.env.POSTGRES_USER)
  console.log('postgres pass for this test: ' + process.env.POSTGRES_PASS)
  console.log('postgres port for this test: ' + process.env.POSTGRES_PORT)
  console.log('postgres db for this test: ' + process.env.POSTGRES_DB)
  console.log('redis host for this test: ' + process.env.REDIS_IP_ADDRESS)
  console.log('redis port for this test: ' + process.env.REDIS_PORT)
  console.log('redis pass for this test: ' + process.env.REDIS_PASS)

  console.log('s3 html template bucket name for this test: ' + process.env.HTML_TEMPLATE_BUCKET_NAME)
  console.log('s3 html template key name for this test: ' + process.env.HTML_TEMPLATE_KEY_NAME)
  console.log('s3 text template bucket name for this test: ' + process.env.TEXT_TEMPLATE_BUCKET_NAME)
  console.log('s3 text template key name for this test: ' + process.env.TEXT_TEMPLATE_KEY_NAME)

  console.log('==========================================================================')

  // const setup = require('./integration/lib/setup')
  // setup.run();     // TODO:  uncomment
}

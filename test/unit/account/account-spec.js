'use strict'

/* eslint-env mocha */
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const uuidv4 = require('uuid/v4')
// const config = require('../../config')

const unit = (fns) => {
  return proxyquire('../../../account/account', {
    './helper': {
      insertPostgresKeyAccount: fns.insertPostgresKeyAccount || (it => it),
      insertPostgresKeyRequest: fns.insertPostgresKeyRequest || (it => it),
      insertPostgresKeyLimit: fns.insertPostgresKeyLimit || (it => it),
      insertPostgresKeyAuthorization: fns.insertPostgresKeyAuthorization || (it => it),
      insertRedisAuthorization: fns.insertRedisAuthorization || (it => it),
      sendAccountCreationTextAndEmail: fns.sendAccountCreationTextAndEmail || (it => it)
    },
    './emailer': {
      sendNewSubscriberEmail: fns.sendNewSubscriberEmail || (it => it)
    }
  })
}

const validContext = { awsRequestId: uuidv4() }
const validEvent = {
  subscription_id: uuidv4(),
  stripeEmail: 'test@ip2geo.co',
  planID: 'plan_GVK3dbrCJxAEqa',
  plan_name: 'mvp_001',
  queryStringParameters: {},
  requestContext: {
    identity: {
      sourceIp: process.env.SOURCE_IP
    }
  },
  headers: {}
}

describe('account/account.create test', () => {
  it('should return well formed error response when error is thrown by validation (null event)', () => {
    const accountProxy = unit({})
    return accountProxy.create(null, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('should return well formed error response when error is thrown by validation (empty event)', () => {
    const event = {}
    const accountProxy = unit({})
    return accountProxy.create(event, validContext)
      .then(response => validateErrorResponse(response))
  })

  it('should return well formed error response when error is thrown by validation (null subscription_id)', () => {
    const event = {
      stripeEmail: 'test@ip2geo.co',
      planID: 'plan_GVK3dbrCJxAEqa',
      plan_name: 'mvp_001',
      queryStringParameters: {},
      requestContext: {
        identity: {
          sourceIp: process.env.SOURCE_IP
        }
      },
      headers: {}
    }
    const accountProxy = unit({})
    return accountProxy.create(event, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('should return well formed error response when error is thrown by validation (empty subscription_id)', () => {
    const event = {
      subscription_id: '',
      stripeEmail: 'test@ip2geo.co',
      planID: 'plan_GVK3dbrCJxAEqa',
      plan_name: 'mvp_001',
      queryStringParameters: {},
      requestContext: {
        identity: {
          sourceIp: process.env.SOURCE_IP
        }
      },
      headers: {}
    }
    const accountProxy = unit({})
    return accountProxy.create(event, validContext)
      .then(response => validateErrorResponse(response))
  })

  it('should return well formed error response when error is thrown by validation (null stripeEail)', () => {
    const event = {
      subscription_id: uuidv4(),
      planID: 'plan_GVK3dbrCJxAEqa',
      plan_name: 'mvp_001',
      queryStringParameters: {},
      requestContext: {
        identity: {
          sourceIp: process.env.SOURCE_IP
        }
      },
      headers: []
    }
    const accountProxy = unit({})
    return accountProxy.create(event, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('should return well formed error response when error is thrown by validation (empty stripeEail)', () => {
    const event = {
      subscription_id: uuidv4(),
      stripeEmail: '',
      planID: 'plan_GVK3dbrCJxAEqa',
      plan_name: 'mvp_001',
      queryStringParameters: {},
      requestContext: {
        identity: {
          sourceIp: process.env.SOURCE_IP
        }
      },
      headers: {}
    }
    const accountProxy = unit({})
    return accountProxy.create(event, validContext)
      .then(response => validateErrorResponse(response))
  })

  it('should return well formed error response when error is thrown by validation (null planID)', () => {
    const event = {
      subscription_id: uuidv4(),
      stripeEmail: 'test@ip2geo.co',
      plan_name: 'mvp_001',
      queryStringParameters: {},
      requestContext: {
        identity: {
          sourceIp: process.env.SOURCE_IP
        }
      },
      headers: {}
    }
    const accountProxy = unit({})
    return accountProxy.create(event, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('should return well formed error response when error is thrown by validation (empty planID)', () => {
    const event = {
      subscription_id: uuidv4(),
      stripeEmail: 'test@ip2geo.co',
      planID: '',
      plan_name: 'mvp_001',
      queryStringParameters: {},
      requestContext: {
        identity: {
          sourceIp: process.env.SOURCE_IP
        }
      },
      headers: {}
    }
    const accountProxy = unit({})
    return accountProxy.create(event, validContext)
      .then(response => validateErrorResponse(response))
  })

  it('should return well formed error response when error is thrown by validation (null plan_name)', () => {
    const event = {
      subscription_id: uuidv4(),
      stripeEmail: 'test@ip2geo.co',
      planID: 'plan_GVK3dbrCJxAEqa',
      queryStringParameters: {},
      requestContext: {
        identity: {
          sourceIp: process.env.SOURCE_IP
        }
      },
      headers: {}
    }
    const accountProxy = unit({})
    return accountProxy.create(event, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('should return well formed error response when error is thrown by validation (empty plan_name)', () => {
    const event = {
      subscription_id: uuidv4(),
      stripeEmail: 'test@ip2geo.co',
      planID: 'plan_GVK3dbrCJxAEqa',
      plan_name: '',
      queryStringParameters: {},
      requestContext: {
        identity: {
          sourceIp: process.env.SOURCE_IP
        }
      },
      headers: {}
    }
    const accountProxy = unit({})
    return accountProxy.create(event, validContext)
      .then(response => validateErrorResponse(response))
  })

  it('should return well formed error response when error is thrown by insertPostgresKeyAccount()', () => {
    const accountProxy = unit({
      insertPostgresKeyAccount: async (data) => {
        throw new Error('insertPostgresKeyAccount error')
      },
      insertPostgresKeyRequest: async (data) => {
        return null
      },
      insertPostgresKeyLimit: async (data) => {
        return null
      },
      insertPostgresKeyAuthorization: async (data) => {
        return null
      },
      insertRedisAuthorization: async (data) => {
        return null
      },
      sendNewSubscriberEmail: async (data) => {
        return null
      },
      sendAccountCreationTextAndEmail: async (data) => {
        return null
      }
    })

    return accountProxy.create(validEvent, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('should return well formed error response when error is thrown by insertPostgresKeyRequest()', () => {
    const accountProxy = unit({
      insertPostgresKeyAccount: async (data) => {
        return null
      },
      insertPostgresKeyRequest: async (data) => {
        throw new Error('insertPostgresKeyRequest error')
      },
      insertPostgresKeyLimit: async (data) => {
        return null
      },
      insertPostgresKeyAuthorization: async (data) => {
        return null
      },
      insertRedisAuthorization: async (data) => {
        return null
      },
      sendNewSubscriberEmail: async (data) => {
        return null
      },
      sendAccountCreationTextAndEmail: async (data) => {
        return null
      }
    })

    return accountProxy.create(validEvent, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('should return well formed error response when error is thrown by insertPostgresKeyLimit()', () => {
    const accountProxy = unit({
      insertPostgresKeyAccount: async (data) => {
        return null
      },
      insertPostgresKeyRequest: async (data) => {
        return null
      },
      insertPostgresKeyLimit: async (data) => {
        throw new Error('insertPostgresKeyLimit error')
      },
      insertPostgresKeyAuthorization: async (data) => {
        return null
      },
      insertRedisAuthorization: async (data) => {
        return null
      },
      sendNewSubscriberEmail: async (data) => {
        return null
      },
      sendAccountCreationTextAndEmail: async (data) => {
        return null
      }
    })

    return accountProxy.create(validEvent, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('should return well formed error response when error is thrown by insertPostgresKeyAuthorization()', () => {
    const accountProxy = unit({
      insertPostgresKeyAccount: async (data) => {
        return null
      },
      insertPostgresKeyRequest: async (data) => {
        return null
      },
      insertPostgresKeyLimit: async (data) => {
        return null
      },
      insertPostgresKeyAuthorization: async (data) => {
        throw new Error('insertPostgresKeyAuthorization error')
      },
      insertRedisAuthorization: async (data) => {
        return null
      },
      sendNewSubscriberEmail: async (data) => {
        return null
      },
      sendAccountCreationTextAndEmail: async (data) => {
        return null
      }
    })

    return accountProxy.create(validEvent, validContext)
      .then(response => validateErrorResponse(response))
  })

  it('should return well formed error response when error is thrown by insertRedisAuthorization()', () => {
    const accountProxy = unit({
      insertPostgresKeyAccount: async (data) => {
        return null
      },
      insertPostgresKeyRequest: async (data) => {
        return null
      },
      insertPostgresKeyLimit: async (data) => {
        return null
      },
      insertPostgresKeyAuthorization: async (data) => {
        return null
      },
      insertRedisAuthorization: async (data) => {
        throw new Error('insertRedisAuthorization error')
      },
      sendNewSubscriberEmail: async (data) => {
        return null
      },
      sendAccountCreationTextAndEmail: async (data) => {
        return null
      }
    })

    return accountProxy.create(validEvent, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('should return well formed success response when insertRedisAuthorization() is successful', () => {
    const accountProxy = unit({
      insertPostgresKeyAccount: async (data) => {
        return null
      },
      insertPostgresKeyRequest: async (data) => {
        return null
      },
      insertPostgresKeyLimit: async (data) => {
        return null
      },
      insertPostgresKeyAuthorization: async (data) => {
        return null
      },
      insertRedisAuthorization: async (data) => {
        return null
      },
      sendNewSubscriberEmail: async (data) => {
        return null
      },
      sendAccountCreationTextAndEmail: async (data) => {
        return null
      }
    })

    return accountProxy.create(validEvent, validContext)
      .then(response => validateSuccessResponse(response))
  })

  it('should return well formed error response when error is thrown by sendNewSubscriberEmail()', () => {
    const accountProxy = unit({
      insertPostgresKeyAccount: async (data) => {
        return null
      },
      insertPostgresKeyRequest: async (data) => {
        return null
      },
      insertPostgresKeyLimit: async (data) => {
        return null
      },
      insertPostgresKeyAuthorization: async (data) => {
        return null
      },
      insertRedisAuthorization: async (data) => {
        return null
      },
      sendNewSubscriberEmail: async (data) => {
        throw new Error('sendNewSubscriberEmail error')
      },
      sendAccountCreationTextAndEmail: async (data) => {
        return null
      }
    })

    return accountProxy.create(validEvent, validContext)
      .then(response => validateErrorResponse(response))
  })
  it('should return well formed success response when sendNewSubscriberEmail() is successful', () => {
    const accountProxy = unit({
      insertPostgresKeyAccount: async (data) => {
        return null
      },
      insertPostgresKeyRequest: async (data) => {
        return null
      },
      insertPostgresKeyLimit: async (data) => {
        return null
      },
      insertPostgresKeyAuthorization: async (data) => {
        return null
      },
      insertRedisAuthorization: async (data) => {
        return null
      },
      sendNewSubscriberEmail: async (data) => {
        return null
      },
      sendAccountCreationTextAndEmail: async (data) => {
        return null
      }
    })

    return accountProxy.create(validEvent, validContext)
      .then(response => validateSuccessResponse(response))
  })

  it('should return well formed success response when error is thrown by sendAccountCreationTextAndEmail()', () => {
    const accountProxy = unit({
      insertPostgresKeyAccount: async (data) => {
        return null
      },
      insertPostgresKeyRequest: async (data) => {
        return null
      },
      insertPostgresKeyLimit: async (data) => {
        return null
      },
      insertPostgresKeyAuthorization: async (data) => {
        return null
      },
      insertRedisAuthorization: async (data) => {
        return null
      },
      sendNewSubscriberEmail: async (data) => {
        return null
      },
      sendAccountCreationTextAndEmail: async (data) => {
        throw new Error('sendAccountCreationTextAndEmail error')
      }
    })

    return accountProxy.create(validEvent, validContext)
      .then(response => validateSuccessResponse(response))
  })
  it('should return well formed success response when sendAccountCreationTextAndEmail() is successsful', () => {
    const accountProxy = unit({
      insertPostgresKeyAccount: async (data) => {
        return null
      },
      insertPostgresKeyRequest: async (data) => {
        return null
      },
      insertPostgresKeyLimit: async (data) => {
        return null
      },
      insertPostgresKeyAuthorization: async (data) => {
        return null
      },
      insertRedisAuthorization: async (data) => {
        return null
      },
      sendNewSubscriberEmail: async (data) => {
        return null
      },
      sendAccountCreationTextAndEmail: async (data) => {
        return null
      }
    })

    return accountProxy.create(validEvent, validContext)
      .then(response => validateSuccessResponse(response))
  })

  it('should return well formed success response when valid invocation - account should be created', () => {
    const accountProxy = unit({
      insertPostgresKeyAccount: async (data) => {
        return null
      },
      insertPostgresKeyRequest: async (data) => {
        return null
      },
      insertPostgresKeyLimit: async (data) => {
        return null
      },
      insertPostgresKeyAuthorization: async (data) => {
        return null
      },
      insertRedisAuthorization: async (data) => {
        return null
      },
      sendNewSubscriberEmail: async (data) => {
        return null
      },
      sendAccountCreationTextAndEmail: async (data) => {
        return null
      }
    })

    return accountProxy.create(validEvent, validContext)
      .then(response => validateSuccessResponse(response))
  })
})

const validateErrorResponse = (response) => {
  expect(response).to.be.an('object')
  expect(response.body).to.be.an('string')

  const payload = JSON.parse(response.body)
  expect(payload.status).to.equal('error')
  expect(payload.status_code).to.equal(500)
  expect(payload.error).to.be.an('object')
  expect(payload.error.message).to.equal('ACCOUNT_CREATION_UNSUCCESSFUL')
  expect(payload.error.code).to.equal(500)
}
const validateSuccessResponse = (response) => {
  expect(response).to.be.an('object')
  expect(response.body).to.be.an('string')

  const payload = JSON.parse(response.body)
  expect(payload.status).to.equal('success')
  expect(payload.status_code).to.equal(200)
}

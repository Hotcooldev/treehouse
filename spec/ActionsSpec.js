const App = require('../lib/App')
const Actions = require('../lib/Actions')

describe("Actions", () => {

  let app, actions

  beforeEach(() => {
    app = new App()
    actions = new Actions(app)
  })

  describe("building and calling actions", () => {
    let activities

    beforeEach(() => {
      activities = {
        spendMoney: (tree, payload) => {
          tree.set({moneySpent: payload.amount})
        }
      }
      actions.register(activities)
    })

    it("calls a registered action", () => {
      let action = actions.build('spendMoney')
      action({amount: 1000000})
      expect(app.tree()).toEqual({moneySpent: 1000000})
      action({amount: -5})
      expect(app.tree()).toEqual({moneySpent: -5})
    })

    it("allows currying the payload when building", () => {
      actions.build('spendMoney', {amount: 1000000})()
      expect(app.tree()).toEqual({moneySpent: 1000000})
    })

    it("blows up on calling if not registered", () => {
      let action = actions.build('somethingElse')
      expect(() => {
        action()
      }).toThrowError(`Can't call action 'somethingElse' as it's not registered`)
    })

    it("automatically commits", () => {
      spyOn(app, 'commit')
      actions.build('spendMoney')({amount: 50})
      expect(app.commit.calls.count()).toEqual(1)
    })

    it("allows calling other actions for async actions", () => {
      spyOn(app, 'log')
      spyOn(actions, 'build').and.callThrough()
      actions.register({
        asyncThing: (tree, payload, action) => {
          action('asyncThingReturned') // won't bother actually calling it
        }
      })
      actions.build('asyncThing')()
      expect(actions.build.calls.count()).toEqual(2)
    })
  })

})

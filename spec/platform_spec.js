import App from '../src/app'
import Platform from '../src/platform'
import Cursor from '../src/cursor'

describe("Platform", () => {

  let app, platform

  beforeEach(() => {
    app = new App()
    platform = new Platform(app, ['users'])
  })

  describe("at", () => {
    it("returns a new platform with the new path", () => {
      expect(platform.path).toEqual(['users'])
      let newPlatform = platform.at(['new', 1])
      expect(newPlatform).toEqual(jasmine.any(Platform))
      expect(newPlatform.path).toEqual(['users', 'new', 1])
    })
  })

  describe("handler", () => {
    it("defaults to a cursor", () => {
      let handler = platform.handler()
      expect(handler).toEqual(jasmine.any(Cursor))
      expect(handler.path).toEqual(['users'])
    })
  })

  describe("getting data", () => {
    let handler

    beforeEach(() => {
      handler = platform.handler()
      spyOn(handler, 'get').and.returnValue('theseAreUsers')
    })

    it("delegates getting to the handler", () => {
      expect(handler.get()).toEqual('theseAreUsers')
    })

    it("allows setting with a function", () => {
    })
  })


  describe("setting data", () => {
    let handler

    beforeEach(() => {
      handler = platform.handler()
      spyOn(handler, 'get').and.returnValue('oldUsers')
      spyOn(handler, 'set')
    })

    it("delegates setting to the handler", () => {
      platform.set('someUsers')
      expect(handler.set).toHaveBeenCalledWith('someUsers')
    })

    it("allows setting with a function", () => {
      platform.set((oldUsers) => {return oldUsers.toUpperCase()} )
      expect(handler.set).toHaveBeenCalledWith('OLDUSERS')
    })

    it("throws an error if the function doesn't return", () => {
      expect(() => {
        platform.set((oldUsers) => {} )
      }).toThrowError("You tried to set a value on the tree with undefined")
    })
  })

})
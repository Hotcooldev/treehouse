import Tree from './tree'
import Facets from './facets'
import DirtyTracker from './dirty_tracker'
import Actions from './actions'

import treeMethods from './mixins/tree_methods'
import dirtyTrackerMethods from './mixins/dirty_tracker_methods'
import actionMethods from './mixins/action_methods'
import reactComponentMethods from './mixins/react_component_methods'

let branchesFromPathMap = (pathMap) => {
  let branches = [], key
  for (key in pathMap) {
    branches.push(pathMap[key][0])
  }
  return branches
}

class App {

  constructor () {
    this.tree = new Tree()
    this.facets = new Facets(this.tree)

    this.dirtyTracker = new DirtyTracker()

    this.tree.onChange(({path}) => {
      this.dirtyTracker.markBranchDirty(path[0])
    })
    this.tree.onCommit(() => {
      this.dirtyTracker.cleanAllDirty()
    })

    this.actions = new Actions(this.tree)
  }

  watch (pathMap, callback) {
    return this.dirtyTracker.watch(branchesFromPathMap(pathMap), () => {
      callback(this.tree)
    })
  }

  extendReact (object) {
    Object.assign(object, actionMethods(this))
    Object.assign(object, treeMethods(this))
    Object.assign(object, dirtyTrackerMethods(this))
    Object.assign(object, reactComponentMethods)
  }

}

export default App

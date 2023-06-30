import Cursor from './Cursor'
import DbView from './DbView'
import DirtyTracker from './DirtyTracker'
import Query from './Query'
import { BunchOfData, Channel, Data, DbChange, DbUpdate, Path, QuerySpec, Queryable, StatePicker, Pipe, WatchCallback } from './types'
import getIn from './utils/getIn'
import setIn from './utils/setIn'

export default class Db implements Queryable {

  dirtyTracker: DirtyTracker
  data: BunchOfData | null
  snapshotID: number
  updates: Array<DbUpdate>

  
  constructor () {
    this.dirtyTracker = new DirtyTracker()
    this.data = null
    this.snapshotID = 0
    this.updates = []
  }

  init (data: BunchOfData): void {
    this.data = data
  }

  pushUpdate (update: DbUpdate): void {
    this.updates.push(update)
  }

  pullData (): BunchOfData | null {
    return this.data
  }

  private applyUpdate = ({ path, value }: DbUpdate) => {
    if (this.data === null) {
      throw new Error("Can't update the db state as it's not been initialised")
    }
    const [bough, ...subbranches] = path
    this.data[bough] = setIn(this.data[bough], subbranches, value)
    this.dirtyTracker.markChannelDirty(this.channelForPath(path))
  }

  private applyUpdates (): Array<DbChange> {
    const changes = this.updates.map(({path, value}) => ({
      path,
      from: getIn(this.data, path),
      to: value,
    }))
    this.updates.forEach(this.applyUpdate)
    this.updates = []
    return changes
  }

  commitUpdates (): Array<DbChange> {
    const changes = this.applyUpdates()
    this.snapshotID++
    this.dirtyTracker.flush()
    return changes
  }

  watchPath (path: Path, callback: WatchCallback): void {
    this.dirtyTracker.track(callback, this.channelForPath(path))
  }

  unwatchPath (path: Path, callback: WatchCallback): void {
    this.dirtyTracker.untrack(callback, this.channelForPath(path))
  }

  channelForPath(path: Path): Channel {
    return path[0]
  }

  at (path: Path): Pipe<Data> {
    return new Cursor(this, path)
  }

  query (spec: QuerySpec, args: any): Pipe<Data> {
    return new Query(this, spec, args)
  }

  view (picker: StatePicker, ...args: Array<any>): Pipe<BunchOfData> {
    const sources =  picker(this, ...args)
    return new DbView(sources)
  }

}

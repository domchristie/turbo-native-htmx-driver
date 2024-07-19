export default class {
  requests = {}

  constructor (delegate) {
    this.delegate = delegate
  }

  get adapter () {
    return this.delegate.adapter
  }

  start () {
    if (!this.started) {
      window.history.scrollRestoration = 'manual'
      window.addEventListener('htmx:confirm', this.#proposeVisit)
      window.addEventListener('htmx:xhr:loadstart', this.#visitRequestStarted)
      window.addEventListener('htmx:afterRequest', this.#visitRequestFinished)
      window.addEventListener('htmx:afterOnLoad', this.#visitRequestCompleted)
      window.addEventListener('htmx:responseError', this.#visitRequestFailed)
      window.addEventListener('htmx:afterSwap', this.#visitRendered)
      window.addEventListener('htmx:historyRestore', this.#visitRendered)
      // TODO: this.#visitCompleted
      this.started = true
    }
  }

  #proposeVisit = (event) => {
    const { target, detail } = event

    if (target['htmx-internal-data']?.boosted) {
      event.preventDefault()
      this.currentTarget = target
      this.uuid = uuid()
      this.request = detail.issueRequest
      this.delegate.visitProposedToLocation(
        new URL(target.href),
        { action: 'advance' }
      )
    }
  }

  #visitRequestStarted = (event) => {
    this.adapter.visitRequestStarted(this.currentVisit)
  }

  #visitRequestFinished = (event) => {
    this.adapter.visitRequestFinished(this.currentVisit)
  }

  #visitRequestCompleted = (event) => {
    this.adapter.visitRequestCompleted(this.currentVisit)
  }

  #visitRequestFailed = (event) => {
    this.adapter.visitRequestFailedWithStatusCode(
      this.currentVisit,
      event.detail.xhr.status
    )
  }

  #visitRendered = (event) => {
    this.adapter.visitRendered(this.currentVisit)
  }

  // # Visit Delegate

  issueRequest (visit) {
    if (visit.action === 'restore') {
      window.history.back()
    } else {
      this.request()
    }
  }

  changeHistory () {}

  loadCachedSnapshot () {}

  loadResponse () {}

  cancelVisit () {
    window.htmx.trigger(this.currentTarget, 'htmx:abort')
  }

  hasCachedSnapshot () {
    return false
  }

  isPageRefresh (visit) {
    return false
  }
}

function uuid () {
  return Array.from({ length: 36 }).map((_, i) => {
    if (i === 8 || i === 13 || i === 18 || i === 23) {
      return '-'
    } else if (i === 14) {
      return '4'
    } else if (i === 19) {
      return (Math.floor(Math.random() * 4) + 8).toString(16)
    } else {
      return Math.floor(Math.random() * 15).toString(16)
    }
  }).join('')
}

// #end Visit Delegate

// # Visit Delegate
// locationWithActionIsSamePage(this.location, this.action) // ❌
// adapter
// view
// history
// visitStarted(this)
// visitCompleted(this)
// visitScrolledToSamePageLocation(this.view.lastRenderedLocation, this.location) //❌

// # Outgoing methods to adapter
// visitRequestStarted(this)
// visitRequestCompleted(this)
// visitRequestFailedWithStatusCode(this)
// visitRequestFinished(this)
// visitRendered(this)
// visitProposedToLocation(this)

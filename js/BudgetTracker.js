export default class BudgetTracker {
  static ENTRIES_DATA_KEY = 'expense-tracker-entries'

  constructor(querySelectorString) {
    this.root = document.querySelector(querySelectorString)
    this.root.innerHTML = BudgetTracker.injectTable()

    this.root
      .querySelector('[data-id="add-btn"]')
      .addEventListener('click', () => this.newEntryBtnHandler())

    this.load()
  }

  static injectTable() {
    return `
    <table class="expense-tracker" dat-id="expense-tracker">
        <thead>
        <tr>
            <td>Date</td>
            <td>Description</td>
            <td>Type</td>
            <td>Amount</td>
            <td></td>
        </tr>
        </thead>

        <tbody class="entries" data-id="entries">
            <!-- entry content to be injected by javascript -->
        </tbody>

        <tbody>
        <tr>
            <td colspan="5" class="controls">
            <button type="button" class="add-entry" data-id="add-btn">
                New Entry
            </button>
            </td>
        </tr>
        </tbody>
        <tfoot>
        <tr>
            <td colspan="5" class="summary" data-id="summary">
            <strong>Total: </strong>
            <span data-id="total">$0.00</span>
            </td>
        </tr>
        </tfoot>
  </table>
    `
  }

  static injectEntry() {
    return `
    <tr class="entries__row" data-id="entries__row">
        <td>
            <input type="date" class="input input-date" data-id="date" />
        </td>
        <td>
            <input
                type="text"
                class="input input-description"
                placeholder="Description (i.e. wages, bills, etc.)"
                data-id="description"
            />
        </td>
        <td>
            <select class="input input-type" data-id="type">
                <option value="income">Income</option>
                <option value="expense">Expense</option>
            </select>
        </td>
        <td> 
            <input
                type="number"
                class="input input-amount"
                step=".01"
                data-id="amount"
            />
        </td>
        <td>
            <button type="button" class="delete-entry" data-id="delete-btn">
                &#10005;
            </button>
        </td>
    </tr>
    `
  }

  load() {
    const entries = JSON.parse(
      localStorage.getItem(BudgetTracker.ENTRIES_DATA_KEY) || '[]'
    )
    entries.forEach((entry) => this.addEntry(entry))
    this.updateSummary()
  }

  updateSummary() {
    const total = this.getEntryRows().reduce((total, row) => {
      const amount = row.querySelector('[data-id="amount"]').value
      const isExpense =
        row.querySelector('[data-id="type"]').value === 'expense'
      const modifier = isExpense ? -1 : 1
      return total + amount * modifier
    }, 0)

    console.log(total)

    const summary = this.root.querySelector('[data-id ="total"]')
    total < 0 ? summary.classList.add('red') : summary.classList.remove('red')
    const totalFormated = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(total)

    summary.textContent = totalFormated
  }

  save() {
    const data = this.getEntryRows().map((row) => {
      return {
        date: row.querySelector('[data-id="date"]').value,
        description: row.querySelector('[data-id="description"]').value,
        type: row.querySelector('[data-id="type"]').value,
        amount: row.querySelector('[data-id="amount"]').value,
      }
    })

    localStorage.setItem(BudgetTracker.ENTRIES_DATA_KEY, JSON.stringify(data))
    this.updateSummary()
  }

  addEntry(entry = {}) {
    this.root
      .querySelector('[data-id="entries"]')
      .insertAdjacentHTML('beforeend', BudgetTracker.injectEntry())

    // TODO: see if data-id selector would work here!

    const row = this.root.querySelector('.entries tr:last-of-type')

    row.querySelector('[data-id="date"]').value =
      entry.date || new Date().toISOString().replace(/T.*/, '')

    row.querySelector('[data-id="description"]').value = entry.description || ''

    row.querySelector('[data-id="type"]').value = entry.type || 'expense'

    row.querySelector('[data-id="amount"]').value = entry.amount || 0.0

    row
      .querySelector('[data-id="delete-btn"]')
      .addEventListener('click', (e) => this.deleteEntryBtnHandler(e))

    row
      .querySelectorAll('.input')
      .forEach((input) => input.addEventListener('change', () => this.save()))
  }

  getEntryRows() {
    return Array.from(this.root.querySelectorAll('.entries tr'))
  }

  newEntryBtnHandler() {
    this.addEntry()
  }

  deleteEntryBtnHandler(e) {
    e.target.closest('tr').remove()
    this.save()
    this.updateSummary()
  }
}

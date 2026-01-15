const formatterCurrency = (currency = "USD") => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: currency,
  minimumFractionDigits: 2,
});


module.exports = formatterCurrency



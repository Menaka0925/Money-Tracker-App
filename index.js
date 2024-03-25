const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/money_tracker')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Define Expense schema
const expenseSchema = new mongoose.Schema({
    category: String,
    amount: Number,
    info: String,
    date: { type: Date, default: Date.now }
});

const Expense = mongoose.model('Expense', expenseSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json()); // Parse JSON bodies

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/add', (req, res) => {
    const { category_select, amount_input, info, date_input } = req.body;
    const newExpense = new Expense({
        category: category_select,
        amount: amount_input,
        info: info,
        date: date_input
    });
    newExpense.save()
        .then(savedExpense => {
            res.json(savedExpense); // Send the saved expense back as response
        })
        .catch(err => {
            console.error('Error adding expense:', err);
            res.status(500).send('Internal Server Error');
        });
});

app.get('/expenses', (req, res) => {
    Expense.find()
        .then(expenses => {
            res.json(expenses);
        })
        .catch(err => {
            console.error('Error fetching expenses:', err);
            res.status(500).send('Internal Server Error');
        });
});

app.delete('/expenses/:id', async (req, res) => {
    try {
        const expenseId = req.params.id;
        await Expense.findByIdAndDelete(expenseId);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

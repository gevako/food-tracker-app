import React, { useState, useEffect } from 'react';
import './App.css';
import FOOD_DATABASE from './foodData';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = ['#27ae60', '#e0e0e0'];

function App() {
  const [foods, setFoods] = useState([]);
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [calories, setCalories] = useState('');
  const [goal, setGoal] = useState(2000);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('history')) || {});

  const today = new Date().toISOString().split('T')[0];

  // Load today's data
  useEffect(() => {
    if (history[today]) {
      setFoods(history[today]);
    }
  }, []);

  // Save to localStorage on update
  useEffect(() => {
    const newHistory = { ...history, [today]: foods };
    setHistory(newHistory);
    localStorage.setItem('history', JSON.stringify(newHistory));
  }, [foods]);

  const handleFoodNameChange = (e) => {
    const name = e.target.value.toLowerCase();
    setFoodName(name);
    if (FOOD_DATABASE[name]) {
      setCalories(FOOD_DATABASE[name]);
    } else {
      setCalories('');
    }
  };

  const addFood = () => {
    if (!foodName || !calories || quantity <= 0) return;
    const totalCalories = Number(calories) * Number(quantity);
    setFoods([...foods, { name: foodName, quantity, calories: totalCalories }]);
    setFoodName('');
    setCalories('');
    setQuantity(1);
  };

  const total = foods.reduce((acc, f) => acc + f.calories, 0);
  const remaining = goal - total;

  const dataForPie = [
    { name: 'Consumed', value: total > goal ? goal : total },
    { name: 'Remaining', value: remaining > 0 ? remaining : 0 }
  ];

  const historyBarData = Object.entries(history).map(([date, entries]) => ({
    date,
    calories: entries.reduce((sum, e) => sum + e.calories, 0)
  }));

  return (
    <div className="App">
      <h1>🍽️ Daily Food Tracker</h1>

      <label>
        Calorie Goal:
        <input
          type="number"
          value={goal}
          onChange={(e) => setGoal(Number(e.target.value))}
        />
      </label>

      <div className="input-group">
        <input
          placeholder="Food name"
          value={foodName}
          onChange={handleFoodNameChange}
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          min="1"
          onChange={(e) => setQuantity(e.target.value)}
        />
        <input
          type="number"
          placeholder="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
        />
        <button onClick={addFood}>Add</button>
      </div>

      <h2>Today's Intake</h2>
      <ul>
        {foods.map((f, i) => (
          <li key={i}>
            {f.quantity} x {f.name} = {f.calories} cal
          </li>
        ))}
      </ul>

      <h3>Total: {total} / {goal} cal</h3>

      <div className="chart-container">
        <h4>Daily Progress</h4>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={dataForPie}
              dataKey="value"
              outerRadius={100}
              innerRadius={60}
              labelLine={false}
              startAngle={90}
              endAngle={-270}
            >
              {dataForPie.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pie-label">{Math.round((total / goal) * 100)}%</div>
      </div>

      <div className="chart-container">
        <h4>History</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={historyBarData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="calories" fill="#27ae60" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;

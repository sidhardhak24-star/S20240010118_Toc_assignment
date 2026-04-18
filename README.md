# 🧠 Turing Machine Simulator  
### Theory of Computation Interactive Project

An interactive web-based simulator for visualizing Turing Machines, designed to help understand core concepts of computability, decidability, and language recognition.


## 🚀 Features

- 🔁 Step-by-step execution of Turing Machines  
- ♾️ Infinite tape visualization  
- ⚡ Adjustable execution speed  
- 📊 Transition table with active rule highlighting  
- 🧾 Execution history tracking  
- 🛠️ Custom Turing Machine builder  
- 📚 Built-in machines:
  - Unary Addition
  - Unary Multiplication
  - aⁿbⁿcⁿ Language Acceptor
- 🧠 Decidability Visualizer:
  - Halting Problem
  - Recognizable vs Decidable
  - Mapping Reductions


## 🖥️ Tech Stack

- HTML5  
- CSS3 (Modern UI with Blue & Gold theme)  
- JavaScript   

## 📂 Project Structure
├── index.html # Main UI structure
├── style.css # Styling and layout
├── script.js # Logic and simulation engine


## ▶️ How to Run

1. Download or clone the repository
2. Open `index.html` in any browser

OR

Deploy using:
- Vercel
- Render
- GitHub Pages
vercel link: :https://s20240010118-toc-assignment.vercel.app/

## 🎮 How to Use

1. Select a machine (Addition / Multiplication / aⁿbⁿcⁿ)
2. Enter input string
3. Click **Load Machine**
4. Use:
   - Step → (manual execution)
   - Run ▶ (automatic execution)
5. Observe:
   - Tape changes
   - State transitions
   - Final result (Accept / Reject)

## 🧪 Example Inputs

| Machine | Input | Output |
|--------|------|--------|
| Addition | `aaaBaa` | `aaaaa` |
| Multiplication | `aaBaaa` | `aaaaaa` |
| aⁿbⁿcⁿ | `aabbcc` | Accepted |


## 🧠 Concepts Covered

- Turing Machines  
- Infinite Tape Model  
- Language Recognition  
- Decidability vs Recognizability  
- Halting Problem  
- Mapping Reductions  

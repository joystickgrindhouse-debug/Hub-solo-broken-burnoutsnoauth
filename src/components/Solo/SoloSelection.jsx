import { useState } from 'react';
import { EXERCISE_LIST, CATEGORIES } from '../../logic/exerciseEngine';

export default function SoloSelection({ onSelectExercise }) {
    const [selectedCategory, setSelectedCategory] = useState(null);

    const filteredExercises = selectedCategory
        ? EXERCISE_LIST.filter(e => e.category === selectedCategory)
        : EXERCISE_LIST;

    return (
        <div className="solo-selection-container">
            <h1 className="solo-title">SOLO MODE</h1>
            <p className="solo-subtitle">Choose your exercise</p>

            <div className="solo-categories">
                <button
                    className={`solo-category-btn ${!selectedCategory ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(null)}
                >
                    ALL
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        className={`solo-category-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat.toUpperCase()}
                    </button>
                ))}
            </div>

            <div className="solo-exercise-grid">
                {filteredExercises.map(exercise => (
                    <button
                        key={exercise.id}
                        className="solo-exercise-card"
                        onClick={() => onSelectExercise(exercise)}
                    >
                        <span className="solo-exercise-category-tag">{exercise.category}</span>
                        <span className="solo-exercise-name">{exercise.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

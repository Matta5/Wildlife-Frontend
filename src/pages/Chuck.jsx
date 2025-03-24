import React, { useEffect, useState } from 'react';

const Chuck = () => {
    const [joke, setJoke] = useState('');

    useEffect(() => {
        const fetchJoke = async () => {
            try {
                const response = await fetch('https://api.chucknorris.io/jokes/random');
                const data = await response.json();
                setJoke(data.value);
            } catch (error) {
                console.error('Error fetching joke:', error);
            }
        };

        fetchJoke();
    }, []);

    return (
        <div>
            <h1>Chuck Norris Joke</h1>
            <p>{joke}</p>
        </div>
    );
};

export default Chuck;
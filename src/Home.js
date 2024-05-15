import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: #333;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  margin: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  color: black;
  background-color: plum;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: plum;
  }
`;

function Home() {
    return (
        <Container>
            <Title>Практичне завдання 1-2</Title>
            <Link to="/users/register">
                <Button>Реєстрація</Button>
            </Link>
            <Link to="/login">
                <Button>Логін</Button>
            </Link>
        </Container>
    );
}

export default Home;

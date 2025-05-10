import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [inviteCode, setInviteCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  const API_URL = 'http://localhost:3000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {

        if (!username || !password) {
          throw new Error('Username and password are required');
        }

        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || `Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        onLogin(data.token, data.user);

        navigate('/dashboard');
      } else {

        if (!username || !password) {
          throw new Error('Username and password are required');
        }

        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long');
        }

        if (!inviteCode) {
          throw new Error('Invitation code is required');
        }

        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            password,
            firstName: firstName || null,
            lastName: lastName || null,
            inviteCode: inviteCode || null
          })
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || `Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        onLogin(data.token, data.user);

        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Authentication error:', err);

      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError(`Could not connect to server. API URL: ${API_URL} - Please make sure the backend is running.`);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
  };

  return (
    <Flex
      minH={'100vh'}
      alignItems={'center'}
      justifyContent={'center'}
      bg={'gray.50'}
    >
      <Container
        maxW={'md'}
        bg={'white'}
        boxShadow={'lg'}
        p={8}
        borderRadius={'lg'}
      >
        <Heading
          textAlign={'center'}
          mb={6}
          color={'gray.700'}
        >
          {isLogin ? 'Login to Greenhouse' : 'Create an Account'}
        </Heading>

        {error && (
          <Box
            bg={'red.100'}
            color={'red.700'}
            p={3}
            mb={4}
            borderRadius={'md'}
          >
            {error}
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <VStack gap={'4'} alignItems={'stretch'}>
            <Box mb={4}>
              <Text mb={2} fontWeight={'medium'}>Username *</Text>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Box>

            <Box mb={4}>
              <Text mb={2} fontWeight={'medium'}>Password *</Text>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Box>

            {!isLogin && (
              <>
                <Box mb={4}>
                  <Text mb={2} fontWeight={'medium'}>Confirm Password *</Text>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </Box>

                <Box mb={4}>
                  <Text mb={2} fontWeight={'medium'}>First Name (Optional)</Text>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </Box>

                <Box mb={4}>
                  <Text mb={2} fontWeight={'medium'}>Last Name (Optional)</Text>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Box>

                <Box mb={4}>
                  <Text mb={2} fontWeight={'medium'}>Invitation Code *</Text>
                  <Input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    required
                  />
                </Box>
              </>
            )}

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              fontSize="md"
              disabled={loading}
              width="100%"
              mt={4}
            >
              {loading ? 
                (isLogin ? 'Logging in...' : 'Creating account...') : 
                (isLogin ? 'Login' : 'Create Account')}
            </Button>
          </VStack>
        </form>

        <Text textAlign="center" mt={6}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Button
            variant="ghost"
            colorScheme="blue"
            onClick={toggleMode}
            size="sm"
            ml={2}
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </Button>
        </Text>
      </Container>
    </Flex>
  );
};

export default Login;
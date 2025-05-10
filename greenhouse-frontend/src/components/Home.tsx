import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
} from '@chakra-ui/react';

const Home: React.FC = () => {
  return (
    <Container maxW="container.xl" py={10}>
      <VStack gap={8} textAlign="center">
        <Heading as="h1" size="2xl" color="green.600">
          Greenhouse Monitoring System
        </Heading>
        
        <Text fontSize="xl" color="gray.600" maxW="container.md">
          Welcome to the Greenhouse Monitoring System. This application allows you to monitor temperature,
          humidity, and environmental conditions in your greenhouse in real-time.
        </Text>

        <Box
          p={10}
          borderRadius="xl"
          bg="green.50"
          boxShadow="md"
          w="full"
          maxW="container.md"
          mx="auto"
          mt={8}
        >
          <VStack gap={6}>
            <Heading as="h2" size="lg" color="green.700">
              Access Your Dashboard
            </Heading>
            
            <Text fontSize="lg">
              View real-time sensor data, historical trends, and manage your greenhouse settings
            </Text>
            
            <Box>
              <RouterLink to="/dashboard">
                <Button
                  colorScheme="green"
                  size="lg"
                  px={8}
                  py={6}
                  fontSize="md"
                  fontWeight="bold"
                  _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
                  transition="all 0.2s"
                >
                  Go to Dashboard
                </Button>
              </RouterLink>
            </Box>
          </VStack>
        </Box>
        
        <Flex wrap="wrap" justify="center" gap={8} mt={12}>
          <Feature 
            title="Real-time Monitoring" 
            description="Track temperature, humidity, and CO2 levels in real-time" 
          />
          <Feature 
            title="Data Analytics" 
            description="View historical trends and analyze greenhouse performance" 
          />
          <Feature 
            title="Smart Alerts" 
            description="Receive notifications when conditions exceed thresholds" 
          />
        </Flex>
      </VStack>
    </Container>
  );
};

// Feature component for the home page
const Feature: React.FC<{ title: string; description: string }> = ({ title, description }) => {
  return (
    <Box 
      p={5} 
      maxW="sm" 
      borderRadius="lg" 
      overflow="hidden" 
      bg="white" 
      boxShadow="sm"
      borderWidth="1px"
      borderColor="gray.100"
      _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
    >
      <Heading as="h3" size="md" mb={2} color="green.600">
        {title}
      </Heading>
      <Text color="gray.600">{description}</Text>
    </Box>
  );
};

export default Home;

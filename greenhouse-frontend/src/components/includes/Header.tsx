import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  Text,
  Button,
  Image,
  IconButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import logoIcon from '../../assets/images/logoicon.png';

interface HeaderProps {
  isLoggedIn: boolean;
  username: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, username, onLogout }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useBreakpointValue({ base: true, md: false });
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <Box
      as="header"
      bg="white"
      py={3}
      px={5}
      boxShadow="sm"
      borderBottom="1px"
      borderColor="gray.200"
      width="100%"
      position="relative"
    >
      <Flex
        as="nav"
        justify="space-between"
        align="center"
        maxW="container.xl"
        mx="auto"
      >
        <Flex alignItems="center">
          <Box width="40px" height="40px" mr={2}>
            <Image 
              src={logoIcon} 
              alt="Via GreenHouse Logo"
              width="100%"
              height="100%"
              objectFit="contain"
            />
          </Box>
          <Box fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
            <Link 
              to="/"
              style={{
                textDecoration: 'none',
                color: '#2e7d32',
              }}
            >
              Via GreenHouse
            </Link>
          </Box>
        </Flex>
        
        {isMobile ? (
          <>
            <Button
              aria-label="Menu"
              onClick={toggleMenu}
              variant="ghost"
              color="green.600"
              size="lg"
              fontWeight="bold"
            >
              ☰
            </Button>
            
            {isMenuOpen && (
              <Box
                position="absolute"
                top="100%"
                right="0"
                bg="white"
                width="200px"
                boxShadow="lg"
                borderRadius="md"
                p={3}
                zIndex={10}
              >
                <Flex direction="column" gap={2}>
                  <Box py={2} px={1} borderRadius="md" _hover={{ bg: "green.50" }}>
                    <Link 
                      to="/"
                      style={{
                        textDecoration: 'none',
                        color: location.pathname === '/' ? '#22c35e' : '#4a5568',
                        fontWeight: location.pathname === '/' ? 'bold' : 'normal',
                        display: 'block',
                        width: '100%'
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </Link>
                  </Box>
                  
                  {isLoggedIn ? (
                    <>
                      <Box py={2} px={1} borderRadius="md" _hover={{ bg: "green.50" }}>
                        <Link 
                          to="/dashboard"
                          style={{
                            textDecoration: 'none',
                            color: location.pathname === '/dashboard' ? '#22c35e' : '#4a5568',
                            fontWeight: location.pathname === '/dashboard' ? 'bold' : 'normal',
                            display: 'block',
                            width: '100%'
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      </Box>
                      
                      <Box py={2} px={1} borderRadius="md" _hover={{ bg: "green.50" }}>
                        <Link 
                          to="/devices"
                          style={{
                            textDecoration: 'none',
                            color: location.pathname === '/devices' ? '#22c35e' : '#4a5568',
                            fontWeight: location.pathname === '/devices' ? 'bold' : 'normal',
                            display: 'block',
                            width: '100%'
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Devices
                        </Link>
                      </Box>

                      <Box py={2} px={1} borderRadius="md" _hover={{ bg: "green.50" }}>
                        <Link 
                          to="/predictions"
                          style={{
                            textDecoration: 'none',
                            color: location.pathname === '/predictions' ? '#22c35e' : '#4a5568',
                            fontWeight: location.pathname === '/predictions' ? 'bold' : 'normal',
                            display: 'block',
                            width: '100%'
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Predictions
                        </Link>
                      </Box>

                      <Box py={2} px={1} borderRadius="md" _hover={{ bg: "green.50" }}>
                        <Link 
                          to="/settings"
                          style={{
                            textDecoration: 'none',
                            color: location.pathname === '/settings' ? '#22c35e' : '#4a5568',
                            fontWeight: location.pathname === '/settings' ? 'bold' : 'normal',
                            display: 'block',
                            width: '100%'
                          }}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Settings
                        </Link>
                      </Box>
                      
                      <Box borderTop="1px" borderColor="gray.200" my={2} />
                      
                      <Text fontSize="sm" color="gray.600" px={1}>
                        Welcome, <Text as="span" fontWeight="bold">{username}</Text>
                      </Text>
                      
                      <Button
                        onClick={() => {
                          onLogout();
                          setIsMenuOpen(false);
                        }}
                        size="sm"
                        colorScheme="red"
                        variant="solid"
                        mt={2}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <Box py={2} px={1} borderRadius="md" _hover={{ bg: "green.50" }}>
                      <Link 
                        to="/login"
                        style={{
                          textDecoration: 'none',
                          color: location.pathname === '/login' ? '#22c35e' : '#4a5568',
                          fontWeight: location.pathname === '/login' ? 'bold' : 'normal',
                          display: 'block',
                          width: '100%'
                        }}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                    </Box>
                  )}
                </Flex>
              </Box>
            )}
          </>
        ) : (
          <HStack alignItems="center" gap="24px">
            <Box>
              <Link 
                to="/"
                style={{
                  textDecoration: 'none',
                  color: location.pathname === '/' ? '#22c35e' : '#4a5568',
                  fontWeight: location.pathname === '/' ? 'bold' : 'normal'
                }}
              >
                Home
              </Link>
            </Box>
            
            {isLoggedIn ? (
              <>
                <Box>
                  <Link 
                    to="/dashboard"
                    style={{
                      textDecoration: 'none',
                      color: location.pathname === '/dashboard' ? '#22c35e' : '#4a5568',
                      fontWeight: location.pathname === '/dashboard' ? 'bold' : 'normal'
                    }}
                  >
                    Dashboard
                  </Link>
                </Box>
                
                <Box>
                  <Link 
                    to="/devices"
                    style={{
                      textDecoration: 'none',
                      color: location.pathname === '/devices' ? '#22c35e' : '#4a5568',
                      fontWeight: location.pathname === '/devices' ? 'bold' : 'normal'
                    }}
                  >
                    Devices
                  </Link>
                </Box>

                <Box>
                  <Link 
                    to="/predictions"
                    style={{
                      textDecoration: 'none',
                      color: location.pathname === '/predictions' ? '#22c35e' : '#4a5568',
                      fontWeight: location.pathname === '/predictions' ? 'bold' : 'normal'
                    }}
                  >
                    Predictions
                  </Link>
                </Box>

                <Box>
                  <Link 
                    to="/settings"
                    style={{
                      textDecoration: 'none',
                      color: location.pathname === '/settings' ? '#22c35e' : '#4a5568',
                      fontWeight: location.pathname === '/settings' ? 'bold' : 'normal'
                    }}
                  >
                    Settings
                  </Link>
                </Box>
                
                <Box borderLeft="1px" borderColor="gray.200" height="20px" mx={2} />
                
                <Flex gap="16px" alignItems="center">
                  <Text fontSize="sm" color="gray.600" display={{ md: 'none', lg: 'block' }}>
                    Welcome, <Text as="span" fontWeight="bold">{username}</Text>
                  </Text>
                  
                  <Button
                    onClick={onLogout}
                    size="sm"
                    colorScheme="red"
                    variant="solid"
                  >
                    Logout
                  </Button>
                </Flex>
              </>
            ) : (
              <Box>
                <Link 
                  to="/login"
                  style={{
                    textDecoration: 'none',
                    color: location.pathname === '/login' ? '#22c35e' : '#4a5568',
                    fontWeight: location.pathname === '/login' ? 'bold' : 'normal'
                  }}
                >
                  Login
                </Link>
              </Box>
            )}
          </HStack>
        )}
      </Flex>
    </Box>
  );
};

export default Header;
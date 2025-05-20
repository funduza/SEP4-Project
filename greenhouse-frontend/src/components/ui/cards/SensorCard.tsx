import React from 'react';
import { Box, Flex, Text, Badge } from '@chakra-ui/react';
import { icons } from '../icons/SensorIcons';
import { ensureNumber } from '../../../utils';

interface SensorCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: keyof typeof icons;
  loading?: boolean;
  idealRange: {
    min: number;
    max: number;
  };
  warningThreshold?: number;
  dangerThreshold?: number;
  secondaryValue?: number | string;
  secondaryUnit?: string;
  gridColumn?: string;
}

const SensorCard: React.FC<SensorCardProps> = ({
  title,
  value,
  unit,
  icon,
  loading = false,
  idealRange,
  warningThreshold,
  dangerThreshold,
  secondaryValue,
  secondaryUnit,
  gridColumn
}) => {
  const numericValue = ensureNumber(value);
  const numericSecondaryValue = secondaryValue ? ensureNumber(secondaryValue) : undefined;

  const getStatusColor = (value: number) => {
    if (dangerThreshold && value > dangerThreshold) return 'red';
    if (warningThreshold && value > warningThreshold) return 'orange';
    if (value < idealRange.min) return 'blue';
    return 'green';
  };

  const statusColor = getStatusColor(numericValue);
  const secondaryStatusColor = numericSecondaryValue ? getStatusColor(numericSecondaryValue) : undefined;

  if (loading) {
    return (
      <Box
        bg="white"
        p={6}
        borderRadius="xl"
        boxShadow="md"
        borderLeftWidth="4px"
        borderLeftColor="gray.300"
        height="100%"
        gridColumn={gridColumn}
      >
        <Flex align="center" mb={4}>
          <Box
            height="80px"
            width="80px"
            borderRadius="lg"
            mr={4}
            bg="gray.100"
          />
          <Box width="100%">
            <Box height="24px" width="50%" mb={2} bg="gray.100" borderRadius="md" />
            <Box height="36px" width="70%" bg="gray.100" borderRadius="md" />
          </Box>
        </Flex>
        <Box height="20px" width="80%" mt={2} bg="gray.100" borderRadius="md" />
      </Box>
    );
  }

  return (
    <Box
      _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg' }}
      _active={{ transform: 'scale(0.98)' }}
      width="100%"
      gridColumn={gridColumn}
    >
      <Box
        bg="white"
        p={{ base: 4, md: 6 }}
        borderRadius="xl"
        boxShadow="md"
        borderLeftWidth="4px"
        borderLeftColor={`${statusColor}.400`}
        height="100%"
        width="100%"
      >
        <Flex 
          align="center" 
          mb={4} 
          direction="row"
          textAlign="left"
          gap={4}
          width="100%"
        >
          <Box
            bg={`${statusColor}.100`}
            p={{ base: 4, md: 4 }}
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            width={{ base: "60px", md: "80px" }}
            height={{ base: "60px", md: "80px" }}
          >
            {icons[icon]({ 
              boxSize: { base: 8, md: 10 },
              color: `${statusColor}.500`
            })}
          </Box>
          <Box flex="1" minW="0">
            <Text 
              fontWeight="bold" 
              fontSize={{ base: "md", md: "lg" }} 
              color="gray.600"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {title}
            </Text>
            {secondaryValue ? (
              <Flex 
                align="center" 
                gap={{ base: 0.5, md: 2 }} 
                flexWrap="nowrap"
                minW="0"
                overflow="hidden"
              >
                <Text 
                  fontSize={{ base: "lg", md: "3xl" }} 
                  fontWeight="bold"
                  color={`${statusColor}.500`}
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  minW="0"
                >
                  {numericValue.toFixed(1)}{unit}
                </Text>
                <Text fontSize={{ base: "md", md: "2xl" }} color="gray.400" mx={{ base: 0.5, md: 1 }}>|</Text>
                <Text 
                  fontSize={{ base: "lg", md: "3xl" }} 
                  fontWeight="bold"
                  color={`${secondaryStatusColor}.500`}
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                  minW="0"
                >
                  {numericSecondaryValue?.toFixed(1)}{secondaryUnit}
                </Text>
              </Flex>
            ) : (
              <Text 
                fontSize={{ base: "2xl", md: "3xl" }} 
                fontWeight="bold"
                textAlign="left"
                color={`${statusColor}.500`}
              >
                {numericValue.toFixed(1)}{unit}
              </Text>
            )}
          </Box>
        </Flex>
        
        <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500" mt={2} textAlign="left">
          Ideal range: <Badge colorScheme="green">{idealRange.min}-{idealRange.max}{unit}</Badge>
        </Text>
      </Box>
    </Box>
  );
};

export default SensorCard; 
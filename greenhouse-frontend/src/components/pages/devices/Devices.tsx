import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Box,
  Heading,
  Input,
  SimpleGrid,
  Flex,
  Text,
  Badge,
  Icon,
} from "@chakra-ui/react";
import DeviceLogs from './DeviceLogs';
import { 
  FaLeaf, 
  FaThermometerHalf, 
  FaTint, 
  FaLightbulb, 
  FaFan, 
  FaSearch, 
  FaSeedling, 
  FaFlask,
  FaMicrochip,
  FaRegLightbulb,
} from "react-icons/fa";
import { 
  MdWater, 
  MdOutlineDeviceThermostat, 
  MdSensors, 
  MdOutlineSettings, 
  MdOutlineSettingsRemote, 
  MdTouchApp,
  MdSpeed
} from "react-icons/md";
import { 
  BsDropletHalf, 
  BsThermometerHalf, 
  BsLightbulbFill, 
  BsLightbulb, 
  BsDisplay, 
  BsCpu 
} from "react-icons/bs";
import { IoWater } from "react-icons/io5";
import { formatTimeAgo } from '../../../utils';

interface BaseDevice {
  id: number;
  name: string;
  type: string;
  status: string;
  last_update: string; // Timestamp from server
  isInteractive: boolean;
}

interface SensorDevice extends BaseDevice {
  isInteractive: false;
  value: number;
  unit?: string;
}

interface ActuatorDevice extends BaseDevice {
  isInteractive: true;
  isOn: boolean;
}

type Device = SensorDevice | ActuatorDevice;

// Server address
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://sep4-backend.onrender.com';

// SVG Icons for fallback if needed
const renderDeviceIcon = (iconType: string, props: any = {}) => {
  const { color, boxSize, ...rest } = props;
  const style = {
    width: typeof boxSize === "number" ? `${boxSize}px` : boxSize || "24px",
    height: typeof boxSize === "number" ? `${boxSize}px` : boxSize || "24px",
    color: color || "currentColor",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    verticalAlign: "middle",
    marginRight: rest.mr ? rest.mr + "px" : "0",
    flexShrink: 0,
    ...rest,
  };

  // Convert device name and type to lowercase
  const lowerIconType = iconType.toLowerCase();

  // Icon selection based on sensor and device name (using React Icons)
  if (lowerIconType.includes('temperature')) {
    return <Icon boxSize={boxSize} color={color} {...rest}><BsThermometerHalf /></Icon>;
  } else if (lowerIconType.includes('humidity') && lowerIconType.includes('soil')) {
    return <Icon boxSize={boxSize} color={color} {...rest}><FaSeedling /></Icon>;
  } else if (lowerIconType.includes('humidity')) {
    return <Icon boxSize={boxSize} color={color} {...rest}><BsDropletHalf /></Icon>;
  } else if (lowerIconType.includes('water') || lowerIconType === 'water pump') {
    return <Icon boxSize={boxSize} color={color} {...rest}><IoWater /></Icon>;
  } else if (lowerIconType.includes('light') && !lowerIconType.includes('panel')) {
    return <Icon boxSize={boxSize} color={color} {...rest}><BsLightbulb /></Icon>;
  } else if (lowerIconType.includes('led') || lowerIconType.includes('panel')) {
    return <Icon boxSize={boxSize} color={color} {...rest}><BsLightbulbFill /></Icon>;
  } else if (lowerIconType.includes('fan') || lowerIconType === 'ventilation') {
    return <Icon boxSize={boxSize} color={color} {...rest}><FaFan /></Icon>;
  } else if (lowerIconType.includes('co2')) {
    return <Icon boxSize={boxSize} color={color} {...rest}><FaFlask /></Icon>;
  } else if (lowerIconType.includes('button')) {
    return <Icon boxSize={boxSize} color={color} {...rest}><MdTouchApp /></Icon>;
  } else if (lowerIconType.includes('servo')) {
    return <Icon boxSize={boxSize} color={color} {...rest}><MdOutlineSettings /></Icon>;
  } else if (lowerIconType.includes('segment') || lowerIconType.includes('display')) {
    return <Icon boxSize={boxSize} color={color} {...rest}><BsDisplay /></Icon>;
  } else if (lowerIconType.includes('proximity')) {
    return <Icon boxSize={boxSize} color={color} {...rest}><MdSensors /></Icon>;
  } else if (lowerIconType.includes('pir')) {
    return <Icon boxSize={boxSize} color={color} {...rest}><MdOutlineSettingsRemote /></Icon>;
  } else if (lowerIconType === 'search') {
    return <Icon boxSize={boxSize} color={color} {...rest}><FaSearch /></Icon>;
  } else {
    // Use leaf icon as default
    return <Icon boxSize={boxSize} color={color} {...rest}><FaLeaf /></Icon>;
  }
};

// Status dot
const StatusDot = ({ isActive }: { isActive: boolean }) => {
  const bgColor = isActive ? "green.400" : "red.400";
  return (
    <Box
      position="absolute"
      top="10px"
      right="10px"
      width="12px"
      height="12px"
      borderRadius="50%"
      bg={bgColor}
      boxShadow={isActive ? "0 0 8px rgba(34, 195, 94, 0.6)" : "0 0 8px rgba(229, 62, 62, 0.6)"}
    />
  );
};

const Devices: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  // Stores the last update timestamps for devices
  const deviceUpdateTimestamps = useRef<Record<number, number>>({});

  const fetchDevices = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/devices`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data: Device[] = await response.json();

      // For each device, set the last update timestamp to the last_update from the server
      data.forEach(device => {
        const ts = new Date(device.last_update).getTime();
        deviceUpdateTimestamps.current[device.id] = ts;
      });

      setDevices(data);
      setError("");
    } catch (err) {
      setError("Could not connect to server. Please check if the backend is running.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchDevices();
    const intervalId = setInterval(fetchDevices, 5000);
    return () => clearInterval(intervalId);
  }, [fetchDevices]);

  // Toggle device
  const toggleDevice = useCallback(async (id: number) => {
    setIsUpdating(id);
    try {
      const device = devices.find(d => d.id === id) as ActuatorDevice;
      if (!device) throw new Error("Device not found");

      const newState = !device.isOn;
      // Optimistic update
      setDevices(devs =>
        devs.map(d =>
          d.id === id && d.isInteractive
            ? { ...(d as ActuatorDevice), isOn: newState, status: newState ? "Active" : "Inactive" }
            : d
        )
      );

      await fetch(
        `${API_BASE_URL}/api/devices/${id}/toggle`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: localStorage.getItem("token") ? `Bearer ${localStorage.getItem("token")}` : "",
          },
          body: JSON.stringify({ status: newState ? "on" : "off" }),
        }
      );

      // Fetch again from server to update
      fetchDevices();
    } catch {
      setError("Error updating device. Please try again.");
      // Rollback the optimistic update
      setDevices(devs =>
        devs.map(d =>
          d.id === id && d.isInteractive
            ? { ...(d as ActuatorDevice), isOn: !(d as ActuatorDevice).isOn, status: (d as ActuatorDevice).isOn ? "Active" : "Inactive" }
            : d
        )
      );
    } finally {
      setIsUpdating(null);
    }
  }, [devices, fetchDevices]);

  const getLastUpdateTime = (deviceId: number) => {
    // If no timestamp exists for this device, use current time
    const ts = deviceUpdateTimestamps.current[deviceId] || Date.now();
    
    // Convert elapsed milliseconds to seconds (truncated with floor)
    const elapsedSeconds = Math.floor((Date.now() - ts) / 1000);
    
    // Pass elapsed seconds to formatTimeAgo function
    return formatTimeAgo(elapsedSeconds);
  };

  const filteredDevices = devices.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box p={5} bg="linear(to-b, green.50, white)" minH="calc(100vh - 64px)">
      <Box maxW="1200px" mx="auto">
        {loading && (
          <Box textAlign="center" py={10}>
            <Box
              w="40px"
              h="40px"
              borderRadius="50%"
              border="4px solid"
              borderColor="green.200"
              borderTopColor="green.500"
              mx="auto"
              className="spinner"
            />
            <Text mt={4} color="gray.600">
              Loading devices...
            </Text>
          </Box>
        )}

        {error && !loading && (
          <Box
            borderRadius="md"
            mb={6}
            p={4}
            bg="red.50"
            color="red.700"
            borderLeft="4px solid"
            borderLeftColor="red.500"
          >
            <Heading size="sm" mb={1}>Error</Heading>
            <Text>{error}</Text>
          </Box>
        )}

        {!loading && !error && devices.length > 0 && (
          <>
            {/* Title and search */}
            <Box textAlign="center" mb={6}>
              <Heading size="lg" color="green.700" mb={2}>Greenhouse Devices</Heading>
              <Text color="gray.600">Monitor and control your devices here</Text>
            </Box>
            <Box maxW="500px" mb={8} mx="auto" position="relative">
              <Icon boxSize="14px" position="absolute" left="12px" top="50%" transform="translateY(-50%)" color="gray.400">
                <FaSearch />
              </Icon>
              <Input
                placeholder="Search devices..."
                size="lg"
                pl="40px"
                bg="white"
                borderColor="gray.200"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                _hover={{ borderColor: "gray.300" }}
                _focus={{ borderColor: "#2e7d32", boxShadow: "0 0 0 1px #2e7d32" }}
                borderRadius="md"
              />
            </Box>

            {/* Device cards */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {filteredDevices.map(device => {
                const isActive = device.status === "Active";
                return (
                  <Box key={device.id} borderWidth="1px" borderRadius="lg" p={6} bg="white" boxShadow="sm" position="relative" height="220px">
                    <StatusDot isActive={isActive} />
                    <Flex direction="column" justify="space-between" height="100%">
                      {/* Title */}
                      <Flex align="center" mb={4}>
                        <Box
                          p={3}
                          borderRadius="md"
                          bg={
                            device.isInteractive &&
                            (device as ActuatorDevice).isOn
                              ? "green.50"
                              : "gray.50"
                          }
                          color={
                            device.isInteractive &&
                            (device as ActuatorDevice).isOn
                              ? "green.500"
                              : "gray.500"
                          }
                          mr={4}
                        >
                          {renderDeviceIcon(device.name, { boxSize: 30 })}
                        </Box>
                        <Box>
                          <Text fontSize="xl" fontWeight="600" color="gray.700" mb={1}>{device.name}</Text>
                          <Flex gap={2} align="center">
                            <Badge
                              colorScheme={device.isInteractive
                                ? (device as ActuatorDevice).isOn ? "green" : "gray"
                                : device.status === "Normal" ? "green" : "yellow"}
                              fontSize="sm"
                              px={2}
                              py={0.5}
                              borderRadius="full"
                            >
                              {device.status}
                            </Badge>
                            <Text fontSize="sm" color="gray.500">{device.type}</Text>
                          </Flex>
                        </Box>
                      </Flex>

                      {/* Sensor / Actuator section */}
                      {device.isInteractive ? (
                        <Flex justify="center" align="center">
                          <Text fontSize="md" fontWeight="500" color={(device as ActuatorDevice).isOn ? "green.500" : "gray.500"} mr={3}>
                            {(device as ActuatorDevice).isOn ? "ON" : "OFF"}
                          </Text>
                          <Box onClick={() => toggleDevice(device.id)} cursor="pointer" w="50px" h="26px" bg={(device as ActuatorDevice).isOn ? "#22c35e" : "gray.300"} borderRadius="full" position="relative" boxShadow="md">
                            <Box position="absolute" top="2px" left={(device as ActuatorDevice).isOn ? "24px" : "4px"} w="22px" h="22px" bg="white" borderRadius="full" boxShadow="0 1px 3px rgba(0,0,0,0.3)" transition="all 0.2s" />
                          </Box>
                        </Flex>
                      ) : (
                        <Box textAlign="center" py={3}>
                          <Text fontSize="3xl" fontWeight="bold" color="gray.700">
                            {(device as SensorDevice).value}
                            <Text as="span" fontSize="xl" fontWeight="normal" color="gray.500" ml={1}>
                              {(device as SensorDevice).unit}
                            </Text>
                          </Text>
                        </Box>
                      )}

                      {/* Last update */}
                      <Flex justify="space-between" align="center">
                        <Text fontSize="xs" color="gray.500">
                          Last update: {getLastUpdateTime(device.id)}
                        </Text>
                      </Flex>
                    </Flex>
                  </Box>
                );
              })}
            </SimpleGrid>

            {/* Activity log */}
            <Box mt={10} borderWidth="1px" borderRadius="lg" p={6} bg="white" boxShadow="sm">
              <Flex align="center" justify="space-between" mb={4}>
                <Heading size="md" color="gray.700">Activity Log</Heading>
                <Text fontSize="sm" color="gray.500">Updates every 5 seconds</Text>
              </Flex>
              <DeviceLogs showTitle={false} compact />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default Devices;

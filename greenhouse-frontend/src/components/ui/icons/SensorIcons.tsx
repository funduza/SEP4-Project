import React from 'react';
import { Box } from '@chakra-ui/react';

// Custom icon wrapper component
const CustomIcon = (props: any) => {
  const { children, ...rest } = props;
  return (
    <Box
      as="span"
      display="flex"
      alignItems="center"
      justifyContent="center"
      lineHeight="1em"
      flexShrink={0}
      height="100%"
      width="100%"
      color="currentColor"
      {...rest}
    >
      {children}
    </Box>
  );
};

// SVG icons defined inline
export const icons = {
  thermometer: (props: any) => (
    <CustomIcon {...props}>
      <svg viewBox="0 0 24 24" width="2.5em" height="2.5em" fill="currentColor" strokeWidth="0.4">
        <path d="M14,14.76V3.5a3,3,0,0,0-3-3H11a3,3,0,0,0-3,3V14.76a5,5,0,1,0,6,0ZM11,5A1,1,0,0,1,12,4a1,1,0,0,1,0,2A1,1,0,0,1,11,5Z" />
      </svg>
    </CustomIcon>
  ),
  droplet: (props: any) => (
    <CustomIcon {...props}>
      <svg viewBox="0 0 24 24" width="2.5em" height="2.5em" fill="currentColor" strokeWidth="0.4">
        <path d="M12,1.85a11.25,11.25,0,0,1,2.53,2.58C16.8,7.44,18,10.82,18,14a6,6,0,0,1-12,0c0-3.18,1.2-6.56,3.47-9.57A11.25,11.25,0,0,1,12,1.85Z" />
      </svg>
    </CustomIcon>
  ),
  alertCircle: (props: any) => (
    <CustomIcon {...props}>
      <svg viewBox="0 0 24 24" width="2.5em" height="2.5em" fill="currentColor" strokeWidth="0.4">
        <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z" />
        <path d="M12,7a1,1,0,0,0-1,1v4a1,1,0,0,0,2,0V8A1,1,0,0,0,12,7Z" />
        <circle cx="12" cy="16" r="1" />
      </svg>
    </CustomIcon>
  ),
  clock: (props: any) => (
    <CustomIcon {...props}>
      <svg viewBox="0 0 24 24" width="2.5em" height="2.5em" fill="currentColor" strokeWidth="0.4">
        <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z" />
        <path d="M12,6a1,1,0,0,0-1,1v5a1,1,0,0,0,.293.707l3,3a1,1,0,0,0,1.414-1.414L13,11.586V7A1,1,0,0,0,12,6Z" />
      </svg>
    </CustomIcon>
  ),
  refresh: (props: any) => (
    <CustomIcon {...props}>
      <svg viewBox="0 0 24 24" width="2.5em" height="2.5em" fill="currentColor" strokeWidth="0.4">
        <path d="M12,5V2L8,6l4,4V7a5,5,0,0,1,5,5,5,5,0,0,1-5,5,5,5,0,0,1-5-5H5a7,7,0,0,0,7,7,7,7,0,0,0,7-7A7,7,0,0,0,12,5Z" />
      </svg>
    </CustomIcon>
  ),
  checkCircle: (props: any) => (
    <CustomIcon {...props}>
      <svg viewBox="0 0 24 24" width="2.5em" height="2.5em" fill="currentColor" strokeWidth="0.4">
        <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z" />
        <path d="M16.58,7.58L10,14.17l-2.59-2.58L6,13l4,4,8-8Z" />
      </svg>
    </CustomIcon>
  ),
  alertTriangle: (props: any) => (
    <CustomIcon {...props}>
      <svg viewBox="0 0 24 24" width="2.5em" height="2.5em" fill="currentColor" strokeWidth="0.4">
        <path d="M22.56,16.3,14.89,3.58a3.43,3.43,0,0,0-5.78,0L1.44,16.3a3,3,0,0,0-.05,3A3.37,3.37,0,0,0,4.33,21H19.67a3.37,3.37,0,0,0,2.94-1.66A3,3,0,0,0,22.56,16.3ZM12,17a1,1,0,1,1,1-1A1,1,0,0,1,12,17Zm1-5a1,1,0,0,1-2,0V8a1,1,0,0,1,2,0Z" />
      </svg>
    </CustomIcon>
  ),
  barChart: (props: any) => (
    <CustomIcon {...props}>
      <svg viewBox="0 0 24 24" width="2.5em" height="2.5em" fill="currentColor" strokeWidth="0.4">
        <path d="M21,20H4V18H21ZM8,17H4V10H8ZM14,17H10V3H14ZM20,17H16V7H20Z" />
      </svg>
    </CustomIcon>
  ),
  database: (props: any) => (
    <CustomIcon {...props}>
      <svg viewBox="0 0 24 24" width="2.5em" height="2.5em" fill="currentColor" strokeWidth="0.4">
        <path d="M12,1C6.5,1,2,2.79,2,5S6.5,9,12,9s10-1.79,10-4S17.5,1,12,1ZM2,11V7.5c0,2.21,4.5,4,10,4s10-1.79,10-4V11c0,2.21-4.5,4-10,4S2,13.21,2,11Zm20,5.5V20c0,2.21-4.5,4-10,4S2,22.21,2,20V16.5c0,2.21,4.5,4,10,4S22,18.71,22,16.5Z" />
      </svg>
    </CustomIcon>
  ),
  co2: (props: any) => (
    <CustomIcon {...props}>
      <svg viewBox="0 0 24 24" width="2.5em" height="2.5em" fill="currentColor" strokeWidth="0.4">
        <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2ZM8,13.5A1.5,1.5,0,1,1,9.5,12,1.5,1.5,0,0,1,8,13.5ZM9,9H6V7h3Zm3,1.5A1.5,1.5,0,1,1,13.5,9,1.5,1.5,0,0,1,12,10.5Zm3,3A1.5,1.5,0,1,1,16.5,12,1.5,1.5,0,0,1,15,13.5Zm0-4.5H15V7h3v2H15Z" />
      </svg>
    </CustomIcon>
  ),
  light: (props: any) => (
    <CustomIcon {...props}>
      <svg viewBox="0 0 24 24" width="2.5em" height="2.5em" fill="currentColor" strokeWidth="0.4">
        <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,18a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"/>
        <path d="M12,6a6,6,0,0,0-6,6,5.89,5.89,0,0,0,.5,2.5L12,12l5.5,2.5A5.89,5.89,0,0,0,18,12,6,6,0,0,0,12,6Z"/>
        <path d="M12,8a4,4,0,0,1,4,4,3.91,3.91,0,0,1-.33,1.5L12,13.5l-3.67-1A3.91,3.91,0,0,1,8,12,4,4,0,0,1,12,8Z"/>
      </svg>
    </CustomIcon>
  ),
}; 
import React from 'react';
import { Image } from 'react-native';

const AdminLogo = () => {
  return (
    <Image
      source={require('./admin_lock_padlock_icon_205891.png')} // Replace with the path to your logo image
      style={{ width: 200, height:350 }} // Adjust the width and height as per your logo dimensions
      resizeMode="contain" // You can use 'contain', 'cover', 'stretch', etc. to adjust the image size
    />
  );
};

export default AdminLogo;

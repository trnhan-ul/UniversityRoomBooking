import React, { useEffect, useState } from 'react';
import { StyleSheet, Image, ScrollView, TouchableOpacity, Text, ImageSourcePropType } from 'react-native';
import { COLORS } from '../constants/theme';

interface ImageGalleryProps {
  images: ImageSourcePropType[];
}

/**
 * Image gallery component with main image and thumbnail strip
 */
export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    setSelectedImage(0);
  }, [images]);

  if (images.length === 0) {
    return <Text style={styles.placeholder}>No room images available.</Text>;
  }

  return (
    <>
      <Image source={images[selectedImage]} style={styles.mainImage} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbRow}
      >
        {images.map((img, index) => (
          <TouchableOpacity
            key={`thumb-${index}`}
            onPress={() => setSelectedImage(index)}
            activeOpacity={0.7}
          >
            <Image
              source={img}
              style={[
                styles.thumbImage,
                index === selectedImage ? styles.thumbActive : undefined,
              ]}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    fontSize: 13,
    color: COLORS.textGray,
  },
  mainImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: COLORS.border,
  },
  thumbRow: {
    gap: 8,
    marginTop: 8,
  },
  thumbImage: {
    width: 68,
    height: 68,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: {
    borderColor: COLORS.primary,
  },
});

export default ImageGallery;

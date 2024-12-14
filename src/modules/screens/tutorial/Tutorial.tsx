/* TODO: the coding exercise is refactoring this file as you see fit */

import * as Animatable from "react-native-animatable";
import * as color from "../../../constants/color";
import * as devices from "../../../constants/devices";
import * as fontSizes from "../../../constants/fontSizes";
import Carousel, { Pagination } from "react-native-snap-carousel";
import FullScreenModal from "../../modal_layout/FullScreenModal";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import StyledText from "../../controls/StyledText";
import TutorialSlide from "./TutorialSlide";
import currentDevice from "../../../lib/getDevice";
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { connect } from "react-redux";

type TutorialProps = {
  visible?: boolean;
  tutorialSlides: TutorialSlide[];
  onPrompt: (promptForLocationAccess: boolean, promptForPushNotifications: boolean) => void;
  onFirstTutorialSlideNextAction: () => void;
};

type TutorialSlide = {
  buttonLabel: string;
  backgroundColor: string;
  description: string;
  image1xUrl: string;
  image2xUrl?: string | undefined;
  image3xUrl?: string | undefined;
  name: string;
  promptForLocationAccess: boolean;
  promptForPushNotifications: boolean;
};

type MapStateToProps = {
  visible: boolean;
};

const { width: viewportWidth, height: viewportHeight } =
  Dimensions.get("window");

// put in consts file
const dotWidth = 10;
const dotHorizontalMargin = 2.5;
const isHeightSimilarToiPhoneOrSmaller = viewportHeight < 600;

const styles = StyleSheet.create({
  container: {
    height: viewportHeight,
  },
  skipButton: {
    padding: devices.deviceSizes[currentDevice] === devices.SMALL ? 10 : 20,
    position: "absolute",
    top: 20,
    right: 0,
    backgroundColor: color.transparent,
  },
  skipButtonText: {
    fontSize: fontSizes.tutorialSkip[devices.deviceSizes[currentDevice]],
    color: color.white,
  },
  bottomContainer: {
    height: viewportHeight * 0.1,
    width: viewportWidth,
    position: "absolute",
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  arrowPlaceHolder: {
    width: 60,
  },
  arrowContainer: {
    paddingHorizontal: 22,
    backgroundColor: "red",
  },
  arrow: {
    width: 16,
    height: 40,
  },
  leftArrow: {
    transform: [{ rotate: "180deg" }],
  },
  dot: {
    width: dotWidth,
    height: dotWidth,
    borderRadius: dotWidth / 2,
    marginTop: isHeightSimilarToiPhoneOrSmaller ? 60 : 2.5,
  },
  paginationContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: color.transparent,
  },
  dotContainerStyle: {
    width: dotWidth + 10,
  },
});

// put in consts file
const strings = {
  skip: "Skip",
};

// import not require
const images = {
  arrow: require("../../../../assets/images/arrow-right-white-big.png"),
};

const gradientColors = [color.transparent, color.blackAlpha6];
const gradientLocations = [0, 1.0];
const gradientStart = { x: 0.5, y: 0 };
const gradientEnd = { x: 1, y: 1 };

const Tutorial: React.FC<TutorialProps> = ({ 
  visible = true, 
  tutorialSlides, 
  onPrompt, 
  onFirstTutorialSlideNextAction 
}) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const carouselRef = useRef<Carousel<TutorialSlide> | null>(null);
  
  useEffect(() => {
    if (!visible) {
      carouselRef.current?.snapToItem(0);
      setCurrentSlide(0);
    }
  }, [visible]); 

  const setActiveIndex = (index: number) => {
    if (index === currentSlide + 1) {
      onPrompt(
        tutorialSlides[currentSlide]
          .promptForLocationAccess,
        tutorialSlides[currentSlide]
          .promptForPushNotifications
      );
    }
    setCurrentSlide(index);
    setIsScrolling(false);
  };

  const handlePrevious = useCallback(() => {
    if (currentSlide > 0 && !isScrolling) {
      setIsScrolling(true);
      carouselRef.current?.snapToItem(currentSlide - 1);
      setActiveIndex(currentSlide - 1)
    }
  }, [currentSlide])

  const handleNext = useCallback(() => {
    if (currentSlide < tutorialSlides.length - 1) {
      if (currentSlide ===  0) {
        onFirstTutorialSlideNextAction();
      }
      if (!isScrolling) {
        setIsScrolling(true);
        carouselRef.current?.snapToItem(currentSlide + 1);
        setActiveIndex(currentSlide + 1);
      }
    }
  }, [currentSlide, tutorialSlides.length, onFirstTutorialSlideNextAction]);

  const onSkipTutorial = () => onPrompt(true, true, true);

  const renderItem = useCallback(
    ({ item, index }: { item: TutorialSlide; index: number }) => (
    <TutorialSlide
      buttonLabel={item.buttonLabel}
      color={item.backgroundColor}
      description={item.description}
      image1xUrl={item.image1xUrl}
      image2xUrl={item?.image2xUrl}
      image3xUrl={item?.image3xUrl}
      index={index}
      shouldClose={index === tutorialSlides.length - 1}
      name={item.name}
      promptForLocationAccess={item.promptForLocationAccess}
      promptForPushNotifications={item.promptForPushNotifications}
      onPrompt={onSkipTutorial}
      onNext={handleNext}
      showConsentText={index === 0}
    />
  ),[onSkipTutorial, handleNext]);

  const renderSkipButton = useCallback(() => (
    <TouchableOpacity
      style={styles.skipButton}
      onPress={onSkipTutorial}
      testID="skip-tutorial-button"
    >
      <StyledText style={styles.skipButtonText}>{strings.skip}</StyledText>
    </TouchableOpacity>
  ),[onPrompt]);

  const renderArrow = useCallback((direction: string) => {
    const isLeft = direction === 'left';
    const isDisabled = 
      (isLeft && currentSlide === 0) || (!isLeft && currentSlide === tutorialSlides.length - 1);

    if (isDisabled) return <View style={styles.arrowPlaceHolder} />;

    return (
      <View>
        <TouchableOpacity
          style={styles.arrowContainer}
          onPress={isLeft ? handlePrevious : handleNext}
          testID={`${direction}-arrow`}
        >
          <Image
            source={images.arrow}
            style={[styles.arrow, isLeft && styles.leftArrow]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    );
  },[currentSlide, tutorialSlides.length, handleNext, handlePrevious]);

  const renderBottom = () => {
    if (!visible) {
      return null;
    }
    const maxAllowed = Math.floor(
      (viewportWidth - 120 - 20) / (dotWidth + 8 * 2 + 2 * dotHorizontalMargin)
    );
    let dotsLength =
      maxAllowed < tutorialSlides.length
        ? maxAllowed
        : tutorialSlides.length;
    const activeDotIndex = currentSlide % dotsLength;
    if (
      tutorialSlides.length % maxAllowed !== 0 &&
      currentSlide >=
        tutorialSlides.length -
          (tutorialSlides.length % maxAllowed)
    ) {
      dotsLength = tutorialSlides.length % maxAllowed;
    }

    return (
      <View style={styles.bottomContainer} pointerEvents="box-none">
        {renderArrow('left')}
        <View style={styles.paginationContainer} pointerEvents="none">
          <Pagination
            dotContainerStyle={styles.dotContainerStyle}
            activeDotIndex={activeDotIndex}
            dotsLength={dotsLength}
            dotColor={color.white}
            inactiveDotColor={color.white}
            inactiveDotScale={1}
            inactiveDotOpacity={0.3}
            dotStyle={styles.dot}
          />
        </View>
        {renderArrow('right')}
      </View>
    );
  };

  const backgroundColor =
    tutorialSlides.length > 0
      ? {
          backgroundColor:
            tutorialSlides[currentSlide].backgroundColor,
        }
      : null;
  
  return (
    <FullScreenModal
      visible={visible}
      side="bottom"
      style={styles.container}
      duration={250}
    >
      <Animatable.View
        style={[backgroundColor, { flex: 1 }]}
        transition="backgroundColor"
        duration={300}
      >
        <LinearGradient
          colors={gradientColors}
          locations={gradientLocations}
          style={StyleSheet.absoluteFill}
          start={gradientStart}
          end={gradientEnd}
        />
        <Carousel
          ref={carouselRef}
          data={tutorialSlides}
          renderItem={renderItem}
          sliderWidth={viewportWidth}
          itemWidth={viewportWidth}
          onSnapToItem={setActiveIndex}
          scrollEnabled={currentSlide === 0 ? false : true}
        />
        {currentSlide !== 0 ? renderSkipButton() : null}
        {renderBottom()}
      </Animatable.View>
    </FullScreenModal>
  );
};

const mapStateToProps = (state: any): MapStateToProps => {
  return {
    visible: state.tutorial.isVisible,
  };
};

export default connect(mapStateToProps)(Tutorial);

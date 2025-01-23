import { useSprings, animated, easings } from "@react-spring/web";
import { useEffect, useRef, useState } from "react";

const SplitText = ({
  text = "",
  className = "",
  delay = 100,
  animationFrom = { opacity: 0, transform: "translate3d(0,40px,0)" },
  animationTo = { opacity: 1, transform: "translate3d(0,0,0)" },
  easing = easings.easeOutCubic,
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "center",
  onLetterAnimationComplete,
}) => {
  const letters = text.split("");
  const [inView, setInView] = useState(false);
  const ref = useRef();
  const animatedCount = useRef(0);

  useEffect(() => {
    // 如果浏览器不支持 IntersectionObserver，直接设置为可见
    if (!('IntersectionObserver' in window)) {
      console.log('IntersectionObserver not supported, setting inView to true');
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log('Intersection observed:', entry.isIntersecting); // 添加调试日志
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { 
        threshold, 
        rootMargin,
      },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [threshold, rootMargin]);

  // 添加调试日志
  useEffect(() => {
    console.log('inView state:', inView);
  }, [inView]);

  const springs = useSprings(
    letters.length,
    letters.map((_, i) => ({
      from: animationFrom,
      to: inView
        ? async (next) => {
            await next(animationTo);
            animatedCount.current += 1;
            if (
              animatedCount.current === letters.length &&
              onLetterAnimationComplete
            ) {
              onLetterAnimationComplete();
            }
          }
        : animationFrom,
      delay: i * delay,
      config: { 
        tension: 300,
        friction: 20,
        easing,
      },
    })),
  );

  // 确保组件挂载后立即可见
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!inView) {
        setInView(true);
      }
    }, 1000); // 1秒后如果还没有触发 IntersectionObserver，强制显示

    return () => clearTimeout(timer);
  }, []);

  return (
    <p
      ref={ref}
      className={`split-parent overflow-hidden inline ${className}`}
      style={{ 
        textAlign,
        visibility: 'visible', // 确保元素可见
        position: 'relative'   // 添加定位上下文
      }}
    >
      {springs.map((props, index) => (
        <animated.span
          key={index}
          style={{
            ...props,
            display: 'inline-block', // 确保正确的显示方式
            visibility: 'visible'    // 确保元素可见
          }}
          className="inline-block transform transition-opacity will-change-transform"
        >
          {letters[index] === " " ? "\u00A0" : letters[index]}
        </animated.span>
      ))}
    </p>
  );
};

export default SplitText;

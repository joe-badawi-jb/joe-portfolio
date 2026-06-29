'use client'

import { animate, createScope, spring, createDraggable, waapi } from 'animejs';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export default function Testing() {

    const root = useRef(null);
    const scope = useRef(null);
    const [rotations, setRotations] = useState(0);
    const [disabled, setDisabled] = useState(false);

    const [xValue, setXValue] = useState(0);
    const [yValue, setYValue] = useState(0);

    useEffect(() => {
        (scope.current as any) = createScope({ root }).add(self => {

            // Every anime.js instance declared here is now scoped to <div ref={root}>

            // Created a bounce animation loop
            animate('.logo', {
                scale: [
                    { to: 1.25, ease: 'inOut(3)', duration: 200 },
                    { to: 1, ease: spring({ bounce: .7 }) }
                ],
                loop: true,
                loopDelay: 250,
            });

            // Make the logo draggable around its center
            createDraggable('.logo', {
                container: [0, 0, 0, 0],
                releaseEase: spring({ bounce: .7 })
            });

            animate('.target-square', {

                translateX: "200px",
                opacity: .5,
                duration: 400,
                delay: 2000,
                ease: 'out(3)',
                alternate: true,

            });

            // Register function methods to be used outside the useEffect
            self?.add('rotateLogo', (i) => {
                animate('.logo', {
                    rotate: i * 360,
                    ease: 'out(4)',
                    duration: 1500,
                });
            });

            self?.add('changeXYValues', (a, b) => {
                const vector = { x: 0, y: 0 };

                animate(vector, {
                    x: a,
                    y: b,
                    duration: 2000,

                    onUpdate: () => {
                        setXValue(Math.round(vector.x));
                        setYValue(Math.round(vector.y));
                    }
                });
            });

            self?.add('handleRotate', (x, direction) => {
                animate('.clock', {
                    rotate: (direction === "pos" ? "+=" + x : "-=" + x),
                    onBegin: () => setDisabled(true),
                    onComplete: () => setDisabled(false)
                })
            });

        });

        // Properly cleanup all anime.js instances declared inside the scope
        return () => (scope.current as any).revert()

    }, []);

    const handleClick = () => {
        setRotations(prev => {
            const newRotations = prev + 1;
            // Animate logo rotation on click using the method declared inside the scope
            (scope.current as any).methods.rotateLogo(newRotations);
            return newRotations;
        });
    };

    const changeXYValues = () => {
        (scope.current as any).methods.changeXYValues(400, 750);
    };

    const updateSquare = () => {
        waapi.animate('.small-to-big-square', {
            x: 240,
            width: 75,
            rotate: '90deg'
        })
    };

    const handleRotate = (angle: number, direction: string) => {
        if (!disabled)
            (scope.current as any).methods.handleRotate(angle, direction);
    }



    return (
        <div ref={root}>
            <section>
                <div className="large centered row p-20">
                    <Image
                        src="/assets/icons/react.svg"
                        alt="React logo"
                        className='logo react'
                        width={100}
                        height={100}
                    />
                </div>
                <div className="medium row">
                    <fieldset className="controls ">
                        <button className='underline decoration-white cursor-pointer' onClick={handleClick}>rotations: {rotations}</button>
                    </fieldset>
                </div>
            </section>

            {/* ========================================= */}


            <section>
                <div className="p-20">
                    <div className='target-square w-20 h-20 bg-blue-500'>
                    </div>
                </div>
            </section>

            {/* ========================================= */}


            <section>
                <div onClick={changeXYValues} className='flex items-center bg-yellow-500/20 px-20 py-10 w-fit cursor-pointer'>
                    <div className='text-yellow-500 xyvalues'>
                        {`"x": ${xValue}, "y": ${yValue}`}
                    </div>
                </div>
            </section>

            {/* ========================================= */}


            <section className='mt-20'>
                <div onClick={updateSquare} className='flex items-center bg-yellow-500/20 px-20 py-10 cursor-pointer'>
                    <div className='w-10 h-10 bg-yellow-500/40 small-to-big-square'></div>
                </div>
            </section>

            {/* ========================================= */}


            <section className='mt-20'>
                <div className=' bg-yellow-500/20 px-20 py-10'>
                    <div className='w-20 h-20 rounded-[50%] border border-yellow-500 relative clock'>
                        <div className='h-3 w-0.5 bg-yellow-500 rounded-sm absolute top-2 left-1/2 -translate-x-1/2'></div>
                    </div>

                    <div className="flex gap-5 items-center mt-5">
                        <div className={`bg-yellow-700 p-2 ${disabled ? "cursor-not-allowed": "cursor-pointer"}`} onClick={() => handleRotate(90, "pos")}>
                            <p className='text-xss'>
                                rotate 90 degrees
                            </p>
                        </div>
                        <div className={`bg-yellow-700 p-2 ${disabled ? "cursor-not-allowed": "cursor-pointer"}`} onClick={() => handleRotate(90, "neg")}>
                            <p className='text-xss'>
                                rotate -90 degrees
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
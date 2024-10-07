import React, { useEffect, useRef, useState } from 'react';

const Home = () => {
    const mainCanvasRef = useRef(null);
    const overlayCanvasRef = useRef(null);
    const [info, setInfo] = useState('Clicked Box: (x, y)');
    const [highlightedPixel, setHighlightedPixel] = useState(null);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState({});

    const cols = 120;
    const rows = 60;
    const boxSize = 10;

    // Define the list of usernames
    const users = ['JATAYU000', 'Drone944', 'Evergreen'];

    // Create pixel_db with default values
    const generatePixelDB = () => {
        const pixel_db = [];
        let x = 0;
        let y = 0;

        while (y < rows) {
            while (x < cols) {
                const hexColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
                // Randomly select a user from the users array
                const user = users[Math.floor(Math.random() * users.length)];
                pixel_db.push({ x, y, hex: hexColor, user });
                x++;
            }
            x = 0; // Reset x after each row
            y++;
        }

        return pixel_db;
    };

    const [pixel_db, setPixelDB] = useState(generatePixelDB);

    // Function to calculate the leaderboard data
    const calculateLeaderboardData = () => {
        const userPixelCount = pixel_db.reduce((acc, pixel) => {
            acc[pixel.user] = (acc[pixel.user] || 0) + 1; // Increment pixel count for each user
            return acc;
        }, {});
        setLeaderboardData(userPixelCount);
    };

    useEffect(() => {
        const mainCanvas = mainCanvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;

        if (mainCanvas && overlayCanvas) {
            const mainCtx = mainCanvas.getContext('2d');
            const overlayCtx = overlayCanvas.getContext('2d');

            const drawGrid = (ctx) => {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                pixel_db.forEach(({ x, y, hex }) => {
                    ctx.fillStyle = hex;
                    ctx.fillRect(x * boxSize, y * boxSize, boxSize, boxSize);
                });

                if (highlightedPixel) {
                    const { x, y } = highlightedPixel;
                    ctx.strokeStyle = 'black';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(x * boxSize, y * boxSize, boxSize, boxSize);
                }
            };

            drawGrid(overlayCtx);

            // Dragging logic
            let isDragging = false;
            let startX, startY;
            let overlayPosition = { top: 0, left: 0 };

            const handleMouseDown = (event) => {
                isDragging = true;
                startX = event.clientX;
                startY = event.clientY;
            };

            const handleMouseMove = (event) => {
                if (isDragging) {
                    const dx = event.clientX - startX;
                    const dy = event.clientY - startY;

                    overlayPosition.top += dy;
                    overlayPosition.left += dx;

                    overlayCanvas.style.top = `${overlayPosition.top}px`;
                    overlayCanvas.style.left = `${overlayPosition.left}px`;

                    startX = event.clientX;
                    startY = event.clientY;
                }
            };

            const handleMouseUp = () => {
                isDragging = false;
            };

            const handleMouseLeave = () => {
                isDragging = false;
            };

            const handleClick = (event) => {
                const rect = overlayCanvas.getBoundingClientRect();
                const x = Math.floor((event.clientX - rect.left) / boxSize);
                const y = Math.floor((event.clientY - rect.top) / boxSize);

                const clickedPixel = pixel_db.find(p => p.x === x && p.y === y);
                if (clickedPixel) {
                    setInfo(`Clicked Box: (${clickedPixel.x}, ${clickedPixel.y}), Color: ${clickedPixel.hex}, User: ${clickedPixel.user}`);
                    setHighlightedPixel({ x: clickedPixel.x, y: clickedPixel.y });
                } else {
                    setInfo(`Clicked Box: (${x}, ${y})`);
                    setHighlightedPixel(null);
                }

                drawGrid(overlayCtx);
            };

            overlayCanvas.addEventListener('mousedown', handleMouseDown);
            overlayCanvas.addEventListener('mousemove', handleMouseMove);
            overlayCanvas.addEventListener('mouseup', handleMouseUp);
            overlayCanvas.addEventListener('mouseleave', handleMouseLeave);
            overlayCanvas.addEventListener('click', handleClick);

            return () => {
                overlayCanvas.removeEventListener('mousedown', handleMouseDown);
                overlayCanvas.removeEventListener('mousemove', handleMouseMove);
                overlayCanvas.removeEventListener('mouseup', handleMouseUp);
                overlayCanvas.removeEventListener('mouseleave', handleMouseLeave);
                overlayCanvas.removeEventListener('click', handleClick);
            };
        }

        // Calculate leaderboard data when pixel_db changes
        calculateLeaderboardData();
    }, [pixel_db, highlightedPixel]); 

    // Set up interval to update leaderboard every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            calculateLeaderboardData(); // Update leaderboard data
        }, 5000);

        return () => clearInterval(interval); // Clean up the interval on unmount
    }, [pixel_db]); // Only run when pixel_db changes

    return (
        <div style={{ position: 'relative', width: '1200px', height: '600px' }}>
            <canvas
                ref={mainCanvasRef}
                width={1200}
                height={600}
                style={{ position: 'absolute' }}
            />
            <canvas
                ref={overlayCanvasRef}
                width={1200}
                height={600}
                style={{ border: '1px solid black', position: 'absolute', top: '0', left: '0' }}
            />
            <div
                style={{
                    position: 'fixed',
                    bottom: '1vh',
                    left: '1vh',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '1vh',
                    fontSize: '2vh',
                    borderRadius: '0.5vw',
                    zIndex: 1000,
                    width: '18vw',
                    height: '10vh',
                    maxWidth: '850px',
                    minWidth: '20px',
                    boxSizing: 'border-box',
                }}
            >
                {info}
            </div>
            <div style={{
                position: 'fixed',
                top: '1vh',
                left: '1vh',
                background: 'rgba(0, 0, 0, 0.7)',
                color: 'white',
                padding: '1vh',
                fontSize: '2vh',
                borderRadius: '0.2vw',
                zIndex: 1000,
                cursor: 'pointer',
                width: '18vw',
            }} onClick={() => setShowLeaderboard(!showLeaderboard)}>
                Leaderboard {showLeaderboard ? '▲' : '▼'}
            </div>
            {showLeaderboard && (
                <div style={{
                    position: 'fixed',
                    top: '6vh',
                    left: '1vh',
                    background: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    padding: '1vh',
                    fontSize: '2vh',
                    borderRadius: '0.2vw',
                    zIndex: 1000,
                    maxHeight: '200px',
                    overflowY: 'auto',
                    width: '18vw',
                }}>
                    <ul style={{ listStyleType: 'none', padding: '0' }}>
                        {Object.entries(leaderboardData).map(([user, count]) => (
                            <li key={user} style={{ margin: '0.5vh 0' }}>
                                {user}: {count} pixels
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Home;

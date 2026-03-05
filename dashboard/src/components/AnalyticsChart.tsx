"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsChart() {
    // Simulated data stream for dashboard visualization
    const [data, setData] = useState([
        { time: '10:00', duration: 12 },
        { time: '10:05', duration: 45 },
        { time: '10:10', duration: 28 },
        { time: '10:15', duration: 80 },
        { time: '10:20', duration: 32 },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setData(currentData => {
                const newTime = new Date();
                const timeString = `${newTime.getHours()}:${newTime.getMinutes().toString().padStart(2, '0')}`;

                // Keep last 10 points
                const newData = [...currentData.slice(-9), {
                    time: timeString,
                    duration: Math.floor(Math.random() * 100) + 10
                }];
                return newData;
            });
        }, 5000); // Add a new point every 5 seconds for live feel

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ResponsiveContainer>
                <LineChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: -20,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#0ea5e9" />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#f8fafc',
                            backdropFilter: 'blur(8px)'
                        }}
                        itemStyle={{ color: '#0ea5e9' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="duration"
                        stroke="url(#colorCost)"
                        strokeWidth={4}
                        dot={{ r: 4, strokeWidth: 2, fill: '#0f172a', stroke: '#8b5cf6' }}
                        activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#0f172a', strokeWidth: 2 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

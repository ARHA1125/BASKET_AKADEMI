'use client';

import { useCoaches, useParents, useStudents } from '@/hooks/use-academic';
import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Category = "red" | "orange" | "emerald" | "gray"
type Metric = {
  label: string
  value: number
  displayValue: string | number
  subtext: string
}

const getCategory = (value: number): Category => {
  if (value < 10) return "red"
  if (value < 50) return "orange"
  return "emerald"
}

const categoryConfig = {
  red: {
    activeClass: "bg-red-500 dark:bg-red-500",
    bars: 1,
  },
  orange: {
    activeClass: "bg-orange-500 dark:bg-orange-500",
    bars: 2,
  },
  emerald: {
    activeClass: "bg-emerald-500 dark:bg-emerald-500",
    bars: 3,
  },
  gray: {
    activeClass: "bg-gray-300 dark:bg-gray-800",
    bars: 0,
  },
} as const

function Indicator({ number }: { number: number }) {
  const category = getCategory(number)
  const config = categoryConfig[category]
  const inactiveClass = "bg-gray-300 dark:bg-gray-800"

  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`h-3.5 w-1 rounded-sm ${
            index < config.bars ? config.activeClass : inactiveClass
          }`}
        />
      ))}
    </div>
  )
}

function MetricCard({ metric }: { metric: Metric }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    if (!numberRef.current || !metric.value) {
      if (numberRef.current && metric.value === 0) {
        numberRef.current.innerText = "0";
      }
      return;
    }
    const obj = { val: 0 };
    gsap.to(obj, {
      val: metric.value,
      duration: 1.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: cardRef.current,
        start: "top 85%",
        once: true
      },
      onUpdate: () => {
        if (numberRef.current) {
          numberRef.current.innerText = Math.floor(obj.val).toString();
        }
      }
    });
  }, { scope: cardRef, dependencies: [metric.value] });

  return (
    <div ref={cardRef} className="gsap-metric-card bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {metric.label}
      </dt>
      <dd className="mt-2 flex items-baseline gap-2">
        <span ref={numberRef} className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          0
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
           {metric.subtext}
        </span>
      </dd>
      <div className="mt-2">
         <Indicator number={metric.value} />
      </div>
    </div>
  )
}

export function MetricsCards() {
  const containerRef = useRef<HTMLDListElement>(null);
  const { total: totalStudents, fetchData: fetchStudents } = useStudents();
  const { total: totalParents, fetchData: fetchParents } = useParents();
  const { total: totalCoaches, fetchData: fetchCoaches } = useCoaches();

  useGSAP(() => {
    gsap.fromTo(".gsap-metric-card",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        stagger: 0.15,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
          once: true
        }
      }
    );
  }, { scope: containerRef });

  useEffect(() => {
    fetchStudents(1, '', 1);
    fetchParents(1, '', 1);
    fetchCoaches(1, '', 1);
  }, [fetchStudents, fetchParents, fetchCoaches]);

  const metrics: Metric[] = [
    {
      label: "Total Students",
      value: totalStudents,
      displayValue: totalStudents,
      subtext: "Active Enrolled",
    },
    {
      label: "Total Parents",
      value: totalParents,
      displayValue: totalParents,
      subtext: "Registered",
    },
    {
      label: "Total Coaches",
      value: totalCoaches,
      displayValue: totalCoaches,
      subtext: "Certified Staff",
    },
  ];

  return (
    <>
      <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-6">
        Overview
      </h1>
      <dl ref={containerRef} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </dl>
    </>
  )
}

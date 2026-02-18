"use client";

import React from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Calendar } from "lucide-react";

interface ProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: string;
}

const programDetails: Record<string, any> = {
  Undergraduate: {
    duration: "4 years",
    mode: "Full-time",
    schoolDays: "Monday - Friday",
    description:
      "Our undergraduate programs provide comprehensive education in various disciplines.",
    icon: BookOpen,
  },
  Postgraduate: {
    duration: "1-2 years",
    mode: "Full-time/Part-time",
    schoolDays: "Monday - Friday",
    description:
      "Advanced degree programs designed for career professionals and scholars.",
    icon: BookOpen,
  },
  HND: {
    duration: "3 years",
    mode: "Full-time",
    schoolDays: "Monday - Friday",
    description:
      "Higher National Diploma programs focusing on practical skills and industry knowledge.",
    icon: BookOpen,
  },
  "Part time": {
    duration: "4-5 years",
    mode: "Part-time",
    schoolDays: "Weekends & Evenings",
    description:
      "Flexible programs designed for working professionals balancing studies and career.",
    icon: Clock,
  },
  Jupeb: {
    duration: "1 year",
    mode: "Full-time",
    schoolDays: "Monday - Friday",
    description:
      "Joint Universities Preliminary Examinations Board program for university entrance.",
    icon: Calendar,
  },
};

export function ProgramModal({ isOpen, onClose, program }: ProgramModalProps) {
  const details = programDetails[program];

  if (!details) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">{program}</DialogTitle>
          <DialogDescription>{details.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Duration</p>
              <p className="text-sm text-muted-foreground">{details.duration}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">Mode</p>
              <p className="text-sm text-muted-foreground">{details.mode}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                School Days
              </p>
              <p className="text-sm text-muted-foreground">
                {details.schoolDays}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Link href="/auth/signup" className="flex-1">
            <Button className="w-full">Apply Now</Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
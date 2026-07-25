"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { logWater } from "@/app/actions/water";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const QUICK = [150, 250, 330, 500, 750];

export function WaterLogForm() {
  const [amount, setAmount] = useState("250");
  const [isPending, startTransition] = useTransition();

  function add(ml: number) {
    startTransition(async () => {
      try {
        await logWater(ml);
        toast.success(`+${ml} ml logged.`);
      } catch {
        toast.error("Couldn't log that. Try again.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {QUICK.map((ml) => (
          <Button key={ml} type="button" variant="outline" size="sm" disabled={isPending} onClick={() => add(ml)}>
            +{ml} ml
          </Button>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <div>
          <label htmlFor="custom-amount" className="text-sm text-muted">
            Custom amount (ml)
          </label>
          <Input
            id="custom-amount"
            type="number"
            min={1}
            max={2000}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1.5 w-32"
          />
        </div>
        <Button type="button" disabled={isPending} onClick={() => add(Number(amount))}>
          Add
        </Button>
      </div>
    </div>
  );
}

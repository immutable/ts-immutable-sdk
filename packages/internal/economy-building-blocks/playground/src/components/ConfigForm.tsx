import React from "react";
import { Card, FormControl, TextInput } from "@biom3/react";

function ConfigForm({
  fields,
  onChange,
}: {
  fields: {
    type: "text" | "number" | "boolean";
    key: string;
    label: string;
    placeholder?: string;
    hint?: string;
    value?: string | number | boolean;
  }[];
  onChange: (key: string, value: any) => void;
}) {
  return (
    <Card>
      <Card.Caption>
        {fields.map((field, idx) => {
          if (field.type === "text") {
            return (
              <FormControl
                sx={{ marginBottom: "base.spacing.x4" }}
                key={`fc-${idx}`}
              >
                <FormControl.Label>{field.label}</FormControl.Label>
                <TextInput
                  value={field.value as string}
                  onChange={async (e) => {
                    onChange(field.key, e.target.value);
                  }}
                  onClearValue={() => {
                    onChange(field.key, "");
                  }}
                  placeholder={field?.placeholder}
                />
                {field?.hint && (
                  <FormControl.Caption>{field.hint}</FormControl.Caption>
                )}
              </FormControl>
            );
          }
        })}

      </Card.Caption>
    </Card>
  );
}

export default ConfigForm;

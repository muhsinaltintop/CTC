import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { StepHeader } from '@/components/molecules/StepHeader';
import { ProjectInformation } from '@/lib/types';

interface ProjectInformationStepProps {
  data: ProjectInformation;
  editable: boolean;
  onChange: (value: Partial<ProjectInformation>) => void;
  onNext: () => void;
  onEdit: () => void;
}

export function ProjectInformationStep({
  data,
  editable,
  onChange,
  onNext,
  onEdit
}: ProjectInformationStepProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <StepHeader
        title="Project Information"
        description="Enter the initial project metadata. MVP currently supports Counterflow tower type and SI units only."
        canEdit={!editable}
        onEdit={onEdit}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          id="projectName"
          label="Project Name"
          placeholder="Ex: Ankara HVAC Upgrade"
          value={data.projectName}
          onChange={(event) => onChange({ projectName: event.target.value })}
          disabled={!editable}
        />

        <Select
          id="towerType"
          label="Tower Type"
          value={data.towerType}
          onChange={(event) => onChange({ towerType: event.target.value as ProjectInformation['towerType'] })}
          disabled={!editable}
          options={[
            { value: 'counterflow', label: 'Counterflow' },
            { value: 'crossflow', label: 'Crossflow (coming soon)', disabled: true }
          ]}
        />

        <Select
          id="unitStandard"
          label="Unit Standards"
          value={data.unitStandard}
          onChange={(event) => onChange({ unitStandard: event.target.value as ProjectInformation['unitStandard'] })}
          disabled={!editable}
          options={[
            { value: 'si', label: 'SI' },
            { value: 'english', label: 'English (coming soon)', disabled: true }
          ]}
        />

        <Input
          id="country"
          label="Country"
          placeholder="Türkiye"
          value={data.country}
          onChange={(event) => onChange({ country: event.target.value })}
          disabled={!editable}
        />

        <Input
          id="city"
          label="City"
          placeholder="Ankara"
          value={data.city}
          onChange={(event) => onChange({ city: event.target.value })}
          disabled={!editable}
        />
      </div>

      {editable ? (
        <div className="mt-5 flex justify-end">
          <Button onClick={onNext}>Next: Thermal Conditions</Button>
        </div>
      ) : null}
    </section>
  );
}

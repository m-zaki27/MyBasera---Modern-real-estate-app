import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CoordinatesField, parseCoordinates } from '@/components/coordinates-field';
import { Chip } from '@/components/filter-chips';
import { FormField } from '@/components/form-field';
import { PhotoField, type PhotoValue } from '@/components/photo-field';
import { PrimaryButton } from '@/components/primary-button';
import { FACILITIES, PROPERTY_TYPES } from '@/constants/property';
import type { ListingValues } from '@/lib/listings-api';
import type { ListingType, PropertyType } from '@/types/database';

export type ListingFormInitial = {
  name: string;
  type: PropertyType;
  listingType: ListingType;
  price: number | null;
  address: string;
  bedrooms: number;
  bathrooms: number;
  area: number | null;
  facilities: string[];
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
};

export const EMPTY_LISTING: ListingFormInitial = {
  name: '',
  type: 'House',
  listingType: 'sale',
  price: null,
  address: '',
  bedrooms: 0,
  bathrooms: 0,
  area: null,
  facilities: [],
  imageUrl: null,
  latitude: null,
  longitude: null,
};

export type ListingSubmission = {
  values: Omit<ListingValues, 'image_url'>;
  photo: PhotoValue;
};

type ListingFormProps = {
  initial: ListingFormInitial;
  submitLabel: string;
  onSubmit: (submission: ListingSubmission) => Promise<void>;
  /** Extra actions under the submit button, e.g. "Delete listing". */
  footer?: ReactNode;
};

type FieldErrors = Partial<
  Record<'name' | 'price' | 'address' | 'bedrooms' | 'bathrooms' | 'area' | 'coordinates', string>
>;

const LISTING_TYPES: readonly { key: ListingType; label: string }[] = [
  { key: 'sale', label: 'For sale' },
  { key: 'rent', label: 'For rent' },
];

const toText = (value: number | null) => (value === null ? '' : String(value));

/** Parses a whole, non-negative number from a text field; null when empty, NaN when invalid. */
function parseWholeNumber(text: string): number | null {
  const cleaned = text.replace(/[,\s]/g, '');
  if (cleaned === '') return null;
  return /^\d+$/.test(cleaned) ? Number(cleaned) : Number.NaN;
}

type SectionProps = {
  title: string;
  children: ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View className="gap-3">
      <Text className="text-base font-bold text-foreground dark:text-foreground-dark">{title}</Text>
      {children}
    </View>
  );
}

type FieldErrorProps = {
  message?: string;
};

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return <Text className="text-xs text-danger-text dark:text-danger-text-dark">{message}</Text>;
}

export function ListingForm({ initial, submitLabel, onSubmit, footer }: ListingFormProps) {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(initial.name);
  const [type, setType] = useState<PropertyType>(initial.type);
  const [listingType, setListingType] = useState<ListingType>(initial.listingType);
  const [price, setPrice] = useState(toText(initial.price));
  const [address, setAddress] = useState(initial.address);
  const [bedrooms, setBedrooms] = useState(String(initial.bedrooms));
  const [bathrooms, setBathrooms] = useState(String(initial.bathrooms));
  const [area, setArea] = useState(toText(initial.area));
  const [facilities, setFacilities] = useState<string[]>(initial.facilities);
  const [latitude, setLatitude] = useState(toText(initial.latitude));
  const [longitude, setLongitude] = useState(toText(initial.longitude));
  const [photo, setPhoto] = useState<PhotoValue>(
    initial.imageUrl ? { kind: 'existing', url: initial.imageUrl } : { kind: 'none' }
  );

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const toggleFacility = (facility: string) =>
    setFacilities((current) =>
      current.includes(facility) ? current.filter((item) => item !== facility) : [...current, facility]
    );

  const handleSubmit = async () => {
    const parsedPrice = parseWholeNumber(price);
    const parsedBedrooms = parseWholeNumber(bedrooms);
    const parsedBathrooms = parseWholeNumber(bathrooms);
    const parsedArea = parseWholeNumber(area);

    const nextErrors: FieldErrors = {};
    if (!name.trim()) nextErrors.name = 'Give the listing a name.';
    if (!address.trim()) nextErrors.address = 'Add the address.';
    if (parsedPrice === null || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      nextErrors.price = 'Enter the price in rupees (numbers only).';
    }
    if (parsedBedrooms === null || Number.isNaN(parsedBedrooms)) nextErrors.bedrooms = 'Enter a number.';
    if (parsedBathrooms === null || Number.isNaN(parsedBathrooms)) nextErrors.bathrooms = 'Enter a number.';
    if (parsedArea !== null && (Number.isNaN(parsedArea) || parsedArea <= 0)) {
      nextErrors.area = 'Enter the area in square feet, or leave it empty.';
    }
    // Coordinates are optional, but if either is filled in, both must be valid.
    const hasCoordinates = latitude.trim() !== '' || longitude.trim() !== '';
    const coordinates = parseCoordinates(latitude, longitude);
    if (hasCoordinates && !coordinates) {
      nextErrors.coordinates =
        'Enter both latitude (−90 to 90) and longitude (−180 to 180) as decimal numbers, or leave both empty.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({
        values: {
          name: name.trim(),
          type,
          listing_type: listingType,
          price: parsedPrice as number,
          address: address.trim(),
          bedrooms: parsedBedrooms as number,
          bathrooms: parsedBathrooms as number,
          area: parsedArea,
          facilities,
          latitude: coordinates?.latitude ?? null,
          longitude: coordinates?.longitude ?? null,
        },
        photo,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerClassName="gap-7 px-screen pt-4"
        // Keep the buttons clear of the home indicator; the inset is a runtime value.
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled">
        <PhotoField value={photo} onChange={setPhoto} />

        <Section title="Basics">
          <View className="gap-1">
            <FormField label="Listing name" value={name} onChangeText={setName} placeholder="Sunny family home" />
            <FieldError message={errors.name} />
          </View>
          <View className="gap-1">
            <FormField
              label="Address"
              value={address}
              onChangeText={setAddress}
              placeholder="House 12, Street 4, DHA Phase 6, Lahore"
              autoComplete="street-address"
              textContentType="fullStreetAddress"
            />
            <FieldError message={errors.address} />
          </View>
        </Section>

        <Section title="Map location">
          <CoordinatesField
            latitude={latitude}
            longitude={longitude}
            onChange={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);
              // Drop a stale "enter both coordinates" error as soon as they change.
              setErrors((current) => ({ ...current, coordinates: undefined }));
            }}
            error={errors.coordinates}
          />
        </Section>

        <Section title="Buy or rent">
          <View className="flex-row flex-wrap gap-2">
            {LISTING_TYPES.map((option) => (
              <Chip
                key={option.key}
                label={option.label}
                selected={listingType === option.key}
                onPress={() => setListingType(option.key)}
              />
            ))}
          </View>
          <View className="gap-1">
            <FormField
              label={listingType === 'rent' ? 'Monthly rent (PKR)' : 'Price (PKR)'}
              value={price}
              onChangeText={setPrice}
              keyboardType="number-pad"
              placeholder={listingType === 'rent' ? '85000' : '25000000'}
            />
            <FieldError message={errors.price} />
          </View>
        </Section>

        <Section title="Property type">
          <View className="flex-row flex-wrap gap-2">
            {PROPERTY_TYPES.map((option) => (
              <Chip key={option} label={option} selected={type === option} onPress={() => setType(option)} />
            ))}
          </View>
        </Section>

        <Section title="Size">
          <View className="flex-row gap-3">
            <View className="flex-1 gap-1">
              <FormField label="Bedrooms" value={bedrooms} onChangeText={setBedrooms} keyboardType="number-pad" />
              <FieldError message={errors.bedrooms} />
            </View>
            <View className="flex-1 gap-1">
              <FormField label="Bathrooms" value={bathrooms} onChangeText={setBathrooms} keyboardType="number-pad" />
              <FieldError message={errors.bathrooms} />
            </View>
          </View>
          <View className="gap-1">
            <FormField
              label="Area (sqft, optional)"
              value={area}
              onChangeText={setArea}
              keyboardType="number-pad"
              placeholder="1800"
            />
            <FieldError message={errors.area} />
          </View>
        </Section>

        <Section title="Facilities">
          <View className="flex-row flex-wrap gap-2">
            {FACILITIES.map((facility) => (
              <Chip
                key={facility}
                label={facility}
                selected={facilities.includes(facility)}
                onPress={() => toggleFacility(facility)}
              />
            ))}
          </View>
        </Section>

        <View className="gap-3">
          {submitError ? (
            <Text className="rounded-field bg-danger-soft px-4 py-3 text-sm text-danger-text dark:bg-danger-soft-dark dark:text-danger-text-dark">
              {submitError}
            </Text>
          ) : null}
          <PrimaryButton title={submitLabel} onPress={handleSubmit} loading={submitting} />
          {footer}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

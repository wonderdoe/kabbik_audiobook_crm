/**
 * @jest-environment node
 */
import { toDigitalOceanSpacesCdnUrl } from './maintenance-config.js';
import {
	computeEffectiveMaintenance,
	crmPayloadToPublicDocument,
	publicDocumentToCrmDto,
	parsePublicDocumentJson,
} from './maintenance-json.js';
import { validateMaintenancePutBody, validatePlatform } from './maintenance-service.js';

describe('toDigitalOceanSpacesCdnUrl', () => {
	it('rewrites DO origin host to CDN host', () => {
		expect(
			toDigitalOceanSpacesCdnUrl('https://kabbik-space.sgp1.digitaloceanspaces.com/kabbik-maintenance'),
		).toBe('https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/kabbik-maintenance');
	});
	it('leaves CDN URLs unchanged', () => {
		const cdn = 'https://kabbik-space.sgp1.cdn.digitaloceanspaces.com/kabbik-maintenance';
		expect(toDigitalOceanSpacesCdnUrl(cdn)).toBe(cdn);
	});
});

describe('validatePlatform', () => {
	it('accepts app and website', () => {
		expect(validatePlatform('app')).toBeNull();
		expect(validatePlatform('website')).toBeNull();
	});
	it('rejects unknown platform', () => {
		expect(validatePlatform('android')).toEqual({
			field: 'platform',
			message: 'Platform must be app or website',
		});
	});
});

describe('validateMaintenancePutBody', () => {
	it('requires boolean isUnderMaintenance', () => {
		const r = validateMaintenancePutBody({});
		expect(r.field).toBe('isUnderMaintenance');
	});

	it('requires EN copy when turning on', () => {
		const r = validateMaintenancePutBody({
			isUnderMaintenance: true,
			titleEn: '',
			messageEn: 'hi',
		});
		expect(r.field).toBe('titleEn');
	});

	it('rejects endsAt before startsAt', () => {
		const r = validateMaintenancePutBody({
			isUnderMaintenance: false,
			startsAt: '2026-10-05T00:00:00.000Z',
			endsAt: '2026-10-04T00:00:00.000Z',
		});
		expect(r.field).toBe('endsAt');
	});
});

describe('computeEffectiveMaintenance', () => {
	const base = {
		isUnderMaintenance: true,
		startsAt: null,
		endsAt: null,
	};

	it('returns false when flag off', () => {
		expect(computeEffectiveMaintenance({ ...base, isUnderMaintenance: false }, '2026-10-03T12:00:00.000Z')).toBe(
			false,
		);
	});

	it('respects future startsAt', () => {
		expect(
			computeEffectiveMaintenance(
				{ ...base, startsAt: '2026-10-04T00:00:00.000Z' },
				'2026-10-03T12:00:00.000Z',
			),
		).toBe(false);
	});

	it('respects past endsAt', () => {
		expect(
			computeEffectiveMaintenance({ ...base, endsAt: '2026-10-03T10:00:00.000Z' }, '2026-10-03T12:00:00.000Z'),
		).toBe(false);
	});

	it('is active inside window', () => {
		expect(
			computeEffectiveMaintenance(
				{
					...base,
					startsAt: '2026-10-03T10:00:00.000Z',
					endsAt: '2026-10-04T00:00:00.000Z',
				},
				'2026-10-03T12:00:00.000Z',
			),
		).toBe(true);
	});
});

describe('JSON mapping', () => {
	it('round-trips CRM DTO and public document', () => {
		const payload = {
			isUnderMaintenance: true,
			titleEn: 'Title',
			titleBn: 'শিরোনাম',
			messageEn: 'Msg',
			messageBn: 'বার্তা',
			startsAt: null,
			endsAt: '2026-10-04T03:00:00.000Z',
		};
		const doc = crmPayloadToPublicDocument('app', payload, 'admin@test', '2026-10-03T17:42:00.000Z');
		expect(doc.platform).toBe('app');
		expect(doc.title.en).toBe('Title');
		const dto = publicDocumentToCrmDto(doc, 'abc');
		expect(dto.titleEn).toBe('Title');
		expect(dto.etag).toBe('abc');
	});

	it('parses stored JSON', () => {
		const text = JSON.stringify({
			schemaVersion: 1,
			platform: 'website',
			isUnderMaintenance: false,
			title: { en: 'A', bn: '' },
			message: { en: 'B', bn: '' },
			startsAt: null,
			endsAt: null,
			updatedBy: 'system',
			updatedAt: '2026-10-03T00:00:00.000Z',
		});
		const { document } = parsePublicDocumentJson(text, 'website');
		expect(document.isUnderMaintenance).toBe(false);
	});
});

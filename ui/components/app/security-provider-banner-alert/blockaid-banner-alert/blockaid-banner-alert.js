import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { captureException } from '@sentry/browser';

import { Text } from '../../../component-library';
import { Severity } from '../../../../helpers/constants/design-system';
import { I18nContext } from '../../../../contexts/i18n';

import {
  BlockaidReason,
  BlockaidResultType,
  SecurityProvider,
} from '../../../../../shared/constants/security-provider';
import SecurityProviderBannerAlert from '../security-provider-banner-alert';

/** Reason to description translation key mapping. Grouped by translations. */
const REASON_TO_DESCRIPTION_TKEY = Object.freeze({
  [BlockaidReason.approvalFarming]: 'blockaidDescriptionApproveFarming',
  [BlockaidReason.permitFarming]: 'blockaidDescriptionApproveFarming',
  [BlockaidReason.setApprovalForAll]: 'blockaidDescriptionApproveFarming',

  [BlockaidReason.blurFarming]: 'blockaidDescriptionBlurFarming',

  [BlockaidReason.seaportFarming]: 'blockaidDescriptionSeaportFarming',

  [BlockaidReason.maliciousDomain]: 'blockaidDescriptionMaliciousDomain',

  [BlockaidReason.rawSignatureFarming]: 'blockaidDescriptionMightLoseAssets',
  [BlockaidReason.tradeOrderFarming]: 'blockaidDescriptionMightLoseAssets',
  [BlockaidReason.unfairTrade]: 'blockaidDescriptionMightLoseAssets',

  [BlockaidReason.rawNativeTokenTransfer]: 'blockaidDescriptionTransferFarming',
  [BlockaidReason.transferFarming]: 'blockaidDescriptionTransferFarming',
  [BlockaidReason.transferFromFarming]: 'blockaidDescriptionTransferFarming',

  [BlockaidReason.other]: 'blockaidDescriptionMightLoseAssets',
});

/** List of suspicious reason(s). Other reasons will be deemed as deceptive. */
const SUSPCIOUS_REASON = [BlockaidReason.rawSignatureFarming];

function BlockaidBannerAlert({ securityAlertResponse }) {
  const t = useContext(I18nContext);

  if (!securityAlertResponse) {
    return null;
  }

  const { reason, result_type: resultType, features } = securityAlertResponse;

  if (
    resultType === BlockaidResultType.Benign ||
    resultType === BlockaidResultType.Failed
  ) {
    return null;
  }

  if (!REASON_TO_DESCRIPTION_TKEY[reason]) {
    captureException(`BlockaidBannerAlert: Unidentified reason '${reason}'`);
  }

  const description = t(REASON_TO_DESCRIPTION_TKEY[reason] || 'other');

  const details = Boolean(features?.length) && (
    <Text as="ul">
      {features.map((feature, i) => (
        <li key={`blockaid-detail-${i}`}>• {feature}</li>
      ))}
    </Text>
  );

  const severity =
    resultType === BlockaidResultType.Malicious
      ? Severity.Danger
      : Severity.Warning;

  const title =
    SUSPCIOUS_REASON.indexOf(reason) > -1
      ? t('blockaidTitleSuspicious')
      : t('blockaidTitleDeceptive');

  return (
    <SecurityProviderBannerAlert
      description={description}
      details={details}
      provider={SecurityProvider.Blockaid}
      severity={severity}
      title={title}
    />
  );
}

BlockaidBannerAlert.propTypes = {
  securityAlertResponse: PropTypes.object,
};

export default BlockaidBannerAlert;

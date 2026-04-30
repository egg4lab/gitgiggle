#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ClassReservationStack } from '../lib/infrastructure-stack';

const app = new cdk.App();

new ClassReservationStack(app, 'ClassReservationStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'ap-northeast-1',
  },
  description: 'Class Reservation System Infrastructure',
});

app.synth();

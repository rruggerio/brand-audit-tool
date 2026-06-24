import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Column,
  Form,
  TextInput,
  Button,
  Checkbox,
  CheckboxGroup,
  RadioButtonGroup,
  RadioButton,
  Select,
  SelectItem,
  Toggle,
  Accordion,
  AccordionItem,
  InlineNotification,
  ProgressIndicator,
  ProgressStep,
  Tile,
  SkeletonText,
} from '@carbon/react';
import {
  ArrowRight,
  ArrowLeft,
  Checkmark,
} from '@carbon/icons-react';
import { useGuidelines, useCreateAudit } from '../hooks/useApi';
import './NewAudit.scss';

interface AuditConfig {
  url: string;
  depth: string;
  guidelines: string[];
  analysisTypes: string[];
  crawlOptions: {
    followExternalLinks: boolean;
    respectRobotsTxt: boolean;
    maxPages: number;
  };
  aiProvider: 'openai' | 'claude' | 'both';
}

const NewAudit: React.FC = () => {
  const navigate = useNavigate();
  const { data: guidelinesData, loading: guidelinesLoading } = useGuidelines();
  const createAudit = useCreateAudit();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const guidelines = guidelinesData?.guidelines || [];

  const [config, setConfig] = useState<AuditConfig>({
    url: '',
    depth: 'single',
    guidelines: [],
    analysisTypes: ['visual', 'component', 'content', 'accessibility'],
    crawlOptions: {
      followExternalLinks: false,
      respectRobotsTxt: true,
      maxPages: 10,
    },
    aiProvider: 'both',
  });

  const steps = [
    'URL Configuration',
    'Guidelines Selection',
    'Analysis Options',
    'Review & Submit',
  ];

  const handleNext = () => {
    // Validate current step
    if (currentStep === 0 && !config.url) {
      setError('Please enter a valid URL');
      return;
    }
    if (currentStep === 1 && config.guidelines.length === 0) {
      setError('Please select at least one guideline');
      return;
    }
    if (currentStep === 2 && config.analysisTypes.length === 0) {
      setError('Please select at least one analysis type');
      return;
    }

    setError(null);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    setError(null);

    try {
      const auditData = {
        url: config.url,
        depth: config.depth,
        guidelines: config.guidelines,
        analysisTypes: config.analysisTypes,
        crawlOptions: config.crawlOptions,
        aiProvider: config.aiProvider,
      };

      const result = await createAudit.mutate(auditData);

      if (result?.id) {
        navigate(`/audits/${result.id}`);
      }
    } catch (err) {
      setError('Audit failed. Make sure the URL is reachable and try again.');
    }
  };

  const loadingMessage = createAudit.loading
    ? 'Running audit — crawling page and calling AI models. This takes 60–120 seconds…'
    : null;

  const handleGuidelineChange = (checked: boolean, id: string) => {
    if (checked) {
      setConfig({
        ...config,
        guidelines: [...config.guidelines, id],
      });
    } else {
      setConfig({
        ...config,
        guidelines: config.guidelines.filter((g) => g !== id),
      });
    }
  };

  const handleAnalysisTypeChange = (checked: boolean, type: string) => {
    if (checked) {
      setConfig({
        ...config,
        analysisTypes: [...config.analysisTypes, type],
      });
    } else {
      setConfig({
        ...config,
        analysisTypes: config.analysisTypes.filter((t) => t !== type),
      });
    }
  };

  return (
    <div className="new-audit-page">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <div className="page-header">
            <h1>Create New Audit</h1>
            <p className="page-description">
              Configure and launch a brand compliance audit for your website
            </p>
          </div>
        </Column>

        <Column lg={4} md={8} sm={4}>
          <div className="progress-sidebar">
            <ProgressIndicator
              currentIndex={currentStep}
              vertical
              spaceEqually
            >
              {steps.map((step, index) => (
                <ProgressStep
                  key={index}
                  label={step}
                  description={index < currentStep ? 'Completed' : ''}
                  complete={index < currentStep}
                />
              ))}
            </ProgressIndicator>
          </div>
        </Column>

        <Column lg={12} md={8} sm={4}>
          {error && (
            <InlineNotification
              kind="error"
              title="Error"
              subtitle={error}
              onClose={() => setError(null)}
              style={{ marginBottom: '1rem' }}
            />
          )}

          <Tile className="form-container">
            <Form onSubmit={(e) => e.preventDefault()}>
              {/* Step 1: URL Configuration */}
              {currentStep === 0 && (
                <div className="form-step">
                  <h2>URL Configuration</h2>
                  <p className="step-description">
                    Enter the URL you want to audit and configure crawl settings
                  </p>

                  <TextInput
                    id="url"
                    labelText="Website URL"
                    placeholder="https://example.com"
                    value={config.url}
                    onChange={(e) => setConfig({ ...config, url: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleNext(); }}
                    required
                  />

                  <RadioButtonGroup
                    legendText="Crawl Depth"
                    name="depth"
                    valueSelected={config.depth}
                    onChange={(value) => setConfig({ ...config, depth: value as string })}
                  >
                    <RadioButton
                      labelText="Single Page"
                      value="single"
                      id="depth-single"
                    />
                    <RadioButton
                      labelText="Entire Site"
                      value="full"
                      id="depth-full"
                    />
                    <RadioButton
                      labelText="Custom Depth"
                      value="custom"
                      id="depth-custom"
                    />
                  </RadioButtonGroup>

                  {config.depth === 'custom' && (
                    <TextInput
                      id="maxPages"
                      labelText="Maximum Pages"
                      type="number"
                      value={config.crawlOptions.maxPages.toString()}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          crawlOptions: {
                            ...config.crawlOptions,
                            maxPages: parseInt(e.target.value) || 10,
                          },
                        })
                      }
                    />
                  )}

                  <Accordion>
                    <AccordionItem title="Advanced Crawl Options">
                      <div className="advanced-options">
                        <Toggle
                          id="followExternalLinks"
                          labelText="Follow External Links"
                          toggled={config.crawlOptions.followExternalLinks}
                          onToggle={(checked) =>
                            setConfig({
                              ...config,
                              crawlOptions: {
                                ...config.crawlOptions,
                                followExternalLinks: checked,
                              },
                            })
                          }
                        />
                        <Toggle
                          id="respectRobotsTxt"
                          labelText="Respect robots.txt"
                          toggled={config.crawlOptions.respectRobotsTxt}
                          onToggle={(checked) =>
                            setConfig({
                              ...config,
                              crawlOptions: {
                                ...config.crawlOptions,
                                respectRobotsTxt: checked,
                              },
                            })
                          }
                        />
                      </div>
                    </AccordionItem>
                  </Accordion>
                </div>
              )}

              {/* Step 2: Guidelines Selection */}
              {currentStep === 1 && (
                <div className="form-step">
                  <h2>Select Guidelines</h2>
                  <p className="step-description">
                    Choose which brand guidelines to audit against
                  </p>

                  {guidelinesLoading ? (
                    <SkeletonText paragraph lineCount={3} />
                  ) : guidelines.length === 0 ? (
                    <InlineNotification
                      kind="warning"
                      title="No guidelines available"
                      subtitle="Please create guidelines first before running an audit."
                      lowContrast
                    />
                  ) : (
                    <CheckboxGroup legendText="Available Guidelines">
                      {guidelines.map((guideline) => (
                        <Checkbox
                          key={guideline.id}
                          id={`guideline-${guideline.id}`}
                          labelText={`${guideline.name} (v${guideline.version})`}
                          checked={config.guidelines.includes(guideline.id)}
                          onChange={(e) => handleGuidelineChange(e.target.checked, guideline.id)}
                        />
                      ))}
                    </CheckboxGroup>
                  )}
                </div>
              )}

              {/* Step 3: Analysis Options */}
              {currentStep === 2 && (
                <div className="form-step">
                  <h2>Analysis Options</h2>
                  <p className="step-description">
                    Configure what aspects of your site to analyze
                  </p>

                  <CheckboxGroup legendText="Analysis Types">
                    <Checkbox
                      id="analysis-visual"
                      labelText="Visual Design Analysis"
                      checked={config.analysisTypes.includes('visual')}
                      onChange={(e) => handleAnalysisTypeChange(e.target.checked, 'visual')}
                    />
                    <Checkbox
                      id="analysis-component"
                      labelText="Component Usage Analysis"
                      checked={config.analysisTypes.includes('component')}
                      onChange={(e) => handleAnalysisTypeChange(e.target.checked, 'component')}
                    />
                    <Checkbox
                      id="analysis-content"
                      labelText="Content & Messaging Analysis"
                      checked={config.analysisTypes.includes('content')}
                      onChange={(e) => handleAnalysisTypeChange(e.target.checked, 'content')}
                    />
                    <Checkbox
                      id="analysis-accessibility"
                      labelText="Accessibility Analysis"
                      checked={config.analysisTypes.includes('accessibility')}
                      onChange={(e) => handleAnalysisTypeChange(e.target.checked, 'accessibility')}
                    />
                  </CheckboxGroup>

                  <Select
                    id="aiProvider"
                    labelText="AI Provider"
                    value={config.aiProvider}
                    onChange={(e) =>
                      setConfig({ ...config, aiProvider: e.target.value as any })
                    }
                  >
                    <SelectItem value="openai" text="OpenAI GPT-4 Vision" />
                    <SelectItem value="claude" text="Anthropic Claude" />
                    <SelectItem value="both" text="Both (Consensus Analysis)" />
                  </Select>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 3 && (
                <div className="form-step">
                  <h2>Review Configuration</h2>
                  <p className="step-description">
                    Review your audit configuration before submitting
                  </p>

                  <div className="review-section">
                    <div className="review-item">
                      <h4>URL</h4>
                      <p>{config.url}</p>
                    </div>

                    <div className="review-item">
                      <h4>Crawl Depth</h4>
                      <p>{config.depth === 'single' ? 'Single Page' : config.depth === 'full' ? 'Entire Site' : `Custom (${config.crawlOptions.maxPages} pages)`}</p>
                    </div>

                    <div className="review-item">
                      <h4>Guidelines</h4>
                      <ul>
                        {config.guidelines.map((id) => (
                          <li key={id}>
                            {id === '1' && 'IBM Brand Guidelines 2024'}
                            {id === '2' && 'Carbon Design System'}
                            {id === '3' && 'Content Style Guide'}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="review-item">
                      <h4>Analysis Types</h4>
                      <ul>
                        {config.analysisTypes.map((type) => (
                          <li key={type}>
                            {type === 'visual' && 'Visual Design Analysis'}
                            {type === 'component' && 'Component Usage Analysis'}
                            {type === 'content' && 'Content & Messaging Analysis'}
                            {type === 'accessibility' && 'Accessibility Analysis'}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="review-item">
                      <h4>AI Provider</h4>
                      <p>
                        {config.aiProvider === 'openai' && 'OpenAI GPT-4 Vision'}
                        {config.aiProvider === 'claude' && 'Anthropic Claude'}
                        {config.aiProvider === 'both' && 'Both (Consensus Analysis)'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Form>
          </Tile>

          {loadingMessage && (
            <InlineNotification
              kind="info"
              title="Audit in progress"
              subtitle={loadingMessage}
              hideCloseButton
              style={{ marginTop: '1rem' }}
            />
          )}

          <div className="form-actions">
            {currentStep > 0 && (
              <Button
                kind="secondary"
                renderIcon={ArrowLeft}
                onClick={handleBack}
                disabled={createAudit.loading}
              >
                Back
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button
                renderIcon={ArrowRight}
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button
                renderIcon={Checkmark}
                onClick={handleSubmit}
                disabled={createAudit.loading}
              >
                {createAudit.loading ? 'Analyzing…' : 'Start Audit'}
              </Button>
            )}
          </div>
        </Column>
      </Grid>
    </div>
  );
};

export default NewAudit;

// Made with Bob

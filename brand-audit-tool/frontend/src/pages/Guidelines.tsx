import React, { useState } from 'react';
import {
  Grid,
  Column,
  Button,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Modal,
  TextInput,
  TextArea,
  FileUploader,
  Tag,
  Accordion,
  AccordionItem,
  SkeletonText,
  InlineNotification,
} from '@carbon/react';
import {
  Add,
  TrashCan,
  Edit,
  DocumentPdf,
  Checkmark,
} from '@carbon/icons-react';
import { useGuidelines, useCreateGuideline } from '../hooks/useApi';
import { api } from '../services/api';
import './Guidelines.scss';

// Backend guideline type (what API returns)
interface BackendGuideline {
  id: string;
  name: string;
  description: string;
  version: string;
  uploadedAt: string;
  fileSize: string;
  status: string;
}

// Frontend guideline type (with additional UI fields)
interface Guideline extends BackendGuideline {
  rules?: GuidelineRule[];
}

interface GuidelineRule {
  category: string;
  rules: string[];
}

const Guidelines: React.FC = () => {
  const { data: guidelinesData, loading, error, refetch } = useGuidelines();
  const createGuideline = useCreateGuideline();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuideline, setSelectedGuideline] = useState<Guideline | null>(null);
  const [notification, setNotification] = useState<{
    kind: 'success' | 'error' | 'info';
    title: string;
    subtitle: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '',
  });

  const guidelines = guidelinesData?.guidelines || [];

  const handleAddGuideline = () => {
    setSelectedGuideline(null);
    setFormData({ name: '', description: '', version: '' });
    setIsModalOpen(true);
  };

  const handleEditGuideline = (guideline: Guideline) => {
    setSelectedGuideline(guideline);
    setFormData({
      name: guideline.name,
      description: guideline.description,
      version: guideline.version,
    });
    setIsModalOpen(true);
  };

  const handleDeleteGuideline = async (id: string) => {
    try {
      await api.guidelines.delete(id);
      await refetch();
      setNotification({
        kind: 'success',
        title: 'Guideline deleted',
        subtitle: 'The guideline has been successfully removed.',
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      setNotification({
        kind: 'error',
        title: 'Delete failed',
        subtitle: 'Failed to delete guideline. Please try again.',
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedGuideline) {
        // Update existing guideline
        await api.guidelines.update(selectedGuideline.id, formData);
        setNotification({
          kind: 'success',
          title: 'Guideline updated',
          subtitle: `${formData.name} has been successfully updated.`,
        });
      } else {
        // Add new guideline
        await createGuideline.mutate(formData);
        setNotification({
          kind: 'success',
          title: 'Guideline added',
          subtitle: `${formData.name} has been successfully added.`,
        });
      }
      await refetch();
      setIsModalOpen(false);
      setTimeout(() => setNotification(null), 5000);
    } catch (err) {
      setNotification({
        kind: 'error',
        title: selectedGuideline ? 'Update failed' : 'Creation failed',
        subtitle: 'Failed to save guideline. Please try again.',
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag type="green" renderIcon={Checkmark}>Active</Tag>;
      case 'draft':
        return <Tag type="blue">Draft</Tag>;
      case 'archived':
        return <Tag type="gray">Archived</Tag>;
      default:
        return <Tag>Unknown</Tag>;
    }
  };

  const headers = [
    { key: 'name', header: 'Name' },
    { key: 'version', header: 'Version' },
    { key: 'status', header: 'Status' },
    { key: 'fileSize', header: 'File Size' },
    { key: 'uploadedAt', header: 'Uploaded' },
    { key: 'actions', header: 'Actions' },
  ];

  const rows = guidelines.map((guideline: BackendGuideline) => ({
    id: guideline.id,
    name: (
      <div className="guideline-name">
        <DocumentPdf size={20} />
        <div>
          <div className="name">{guideline.name}</div>
          <div className="description">{guideline.description}</div>
        </div>
      </div>
    ),
    version: guideline.version,
    status: getStatusTag(guideline.status),
    fileSize: guideline.fileSize || 'N/A',
    uploadedAt: new Date(guideline.uploadedAt).toLocaleDateString(),
    actions: (
      <div className="action-buttons">
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Edit}
          iconDescription="Edit"
          hasIconOnly
          onClick={() => handleEditGuideline(guideline as Guideline)}
        />
        <Button
          kind="danger--ghost"
          size="sm"
          renderIcon={TrashCan}
          iconDescription="Delete"
          hasIconOnly
          onClick={() => handleDeleteGuideline(guideline.id)}
        />
      </div>
    ),
  }));

  return (
    <div className="guidelines-page">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <div className="page-header">
            <div>
              <h1>Brand Guidelines</h1>
              <p className="page-description">
                Manage your brand guidelines and design system documentation
              </p>
            </div>
            <Button renderIcon={Add} onClick={handleAddGuideline}>
              Add Guideline
            </Button>
          </div>
        </Column>

        {notification && (
          <Column lg={16} md={8} sm={4}>
            <InlineNotification
              kind={notification.kind}
              title={notification.title}
              subtitle={notification.subtitle}
              onClose={() => setNotification(null)}
            />
          </Column>
        )}

        {error && (
          <Column lg={16} md={8} sm={4}>
            <InlineNotification
              kind="error"
              title="Error loading guidelines"
              subtitle={error.message || 'Failed to load guidelines'}
              onClose={() => {}}
            />
          </Column>
        )}

        <Column lg={16} md={8} sm={4}>
          {loading ? (
            <SkeletonText paragraph lineCount={5} />
          ) : error ? null : (
            <DataTable rows={rows} headers={headers}>
              {({
                rows,
                headers,
                getTableProps,
                getHeaderProps,
                getRowProps,
              }) => (
                <TableContainer title="Guidelines Library">
                  <Table {...getTableProps()}>
                    <TableHead>
                      <TableRow>
                        {headers.map((header) => (
                          <TableHeader {...getHeaderProps({ header })} key={header.key}>
                            {header.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow {...getRowProps({ row })} key={row.id}>
                          {row.cells.map((cell) => (
                            <TableCell key={cell.id}>{cell.value}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DataTable>
          )}
        </Column>

        {/* Guideline Rules Preview */}
        {!loading && !error && guidelines.length > 0 && (
          <Column lg={16} md={8} sm={4}>
            <div className="rules-section">
              <h2>Active Guidelines Rules</h2>
              <Accordion>
                {guidelines
                  .filter((g: BackendGuideline) => g.status === 'active')
                  .map((guideline: BackendGuideline) => (
                    <AccordionItem
                      title={guideline.name}
                      key={guideline.id}
                    >
                      <div className="rules-content">
                        {(guideline as Guideline).rules && (guideline as Guideline).rules!.length > 0 ? (
                          (guideline as Guideline).rules!.map((ruleGroup: GuidelineRule, idx: number) => (
                            <div key={idx} className="rule-group">
                              <h4>{ruleGroup.category}</h4>
                              <ul>
                                {ruleGroup.rules.map((rule: string, ruleIdx: number) => (
                                  <li key={ruleIdx}>{rule}</li>
                                ))}
                              </ul>
                            </div>
                          ))
                        ) : (
                          <p>No rules defined for this guideline yet.</p>
                        )}
                      </div>
                    </AccordionItem>
                  ))}
              </Accordion>
            </div>
          </Column>
        )}
      </Grid>

      {/* Add/Edit Modal */}
      <Modal
        open={isModalOpen}
        modalHeading={selectedGuideline ? 'Edit Guideline' : 'Add New Guideline'}
        primaryButtonText={selectedGuideline ? 'Update' : 'Add'}
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsModalOpen(false)}
        onRequestSubmit={handleSubmit}
        size="md"
      >
        <div className="modal-content">
          <TextInput
            id="name"
            labelText="Guideline Name"
            placeholder="e.g., IBM Brand Guidelines 2024"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <TextArea
            id="description"
            labelText="Description"
            placeholder="Brief description of the guideline"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <TextInput
            id="version"
            labelText="Version"
            placeholder="e.g., 1.0.0"
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
          />
          <FileUploader
            labelTitle="Upload PDF"
            labelDescription="Max file size is 10MB. Only PDF files are supported."
            buttonLabel="Select file"
            filenameStatus="edit"
            accept={['.pdf']}
            multiple={false}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Guidelines;

// Made with Bob

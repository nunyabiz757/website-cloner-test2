import { Server, Layout, Code, Zap } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface WebsiteInfoProps {
  url: string;
  cms?: string;
  pageBuilder?: string;
  technologies?: string[];
}

export function WebsiteInfo({ url, cms, pageBuilder, technologies = [] }: WebsiteInfoProps) {
  return (
    <Card>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Website Information</h3>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Server className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-1">URL</p>
            <p className="text-sm text-gray-600 break-all">{url}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Layout className="text-purple-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-1">CMS</p>
            <Badge className="bg-purple-100 text-purple-700">
              {cms || 'Unknown'}
            </Badge>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Zap className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 mb-1">Page Builder</p>
            <Badge className="bg-orange-100 text-orange-700">
              {pageBuilder || 'None Detected'}
            </Badge>
          </div>
        </div>

        {technologies.length > 0 && (
          <div className="flex items-start gap-3">
            <Code className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 mb-2">Technologies</p>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech, index) => (
                  <Badge key={index} className="bg-green-100 text-green-700">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
